
import { WeatherData } from '../types';

// Map WMO Weather Codes to our simplified conditions
const mapWmoCodeToCondition = (code: number): 'Sunny' | 'Cloudy' | 'Rain' | 'Snow' => {
  // 0: Clear sky
  if (code === 0 || code === 1) return 'Sunny';
  
  // 2: Partly cloudy, 3: Overcast
  if (code === 2 || code === 3) return 'Cloudy';
  
  // 45, 48: Fog (Treat as cloudy for simplicity)
  if (code === 45 || code === 48) return 'Cloudy';
  
  // 51-67: Drizzle, Rain, Freezing Rain
  if (code >= 51 && code <= 67) return 'Rain';
  
  // 71-77: Snow
  if (code >= 71 && code <= 77) return 'Snow';
  
  // 80-82: Rain showers
  if (code >= 80 && code <= 82) return 'Rain';
  
  // 85-86: Snow showers
  if (code === 85 || code === 86) return 'Snow';
  
  // 95-99: Thunderstorm (Treat as Rain)
  if (code >= 95 && code <= 99) return 'Rain';

  return 'Sunny';
};

// Helper to extract a searchable city name
const extractCityName = (location: string): string => {
  if (!location) return '';
  if (location.includes('➔')) {
    const parts = location.split('➔');
    return parts[parts.length - 1].trim();
  }
  if (location.includes('->')) {
    const parts = location.split('->');
    return parts[parts.length - 1].trim();
  }
  return location.trim();
};

// Helper to parse rough time to hour (0-23)
const parseHourFromTime = (timeStr: string): number | null => {
  if (!timeStr) return null;
  const lower = timeStr.toLowerCase();

  // 1. Try HH:MM format
  const timeMatch = lower.match(/(\d{1,2})[:：](\d{2})/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const isPM = lower.includes('pm') || lower.includes('下午') || lower.includes('晚上');
    const isAM = lower.includes('am') || lower.includes('上午');
    
    // Simple 12h to 24h conversion
    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    return hour;
  }

  // 2. Keywords mapping
  if (lower.includes('morning') || lower.includes('早上') || lower.includes('上午')) return 9;
  if (lower.includes('noon') || lower.includes('中午')) return 12;
  if (lower.includes('afternoon') || lower.includes('下午')) return 14;
  if (lower.includes('evening') || lower.includes('傍晚')) return 18;
  if (lower.includes('night') || lower.includes('晚上')) return 21;

  return null;
};

// Helper to calculate days difference using Local Time Midnight
// This ensures we respect the user's browser timezone
export const getDaysDiff = (dateStr: string): number => {
  // Parse YYYY-MM-DD into local components
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Create date object for midnight of that day in LOCAL time
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  // Get today's midnight in LOCAL time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// --- Daily Forecast (Range) ---
export const fetchWeatherForDay = async (location: string, dateStr: string): Promise<WeatherData | null> => {
  try {
    const city = extractCityName(location);
    if (!city) return null;

    // 1. Geocoding
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) return null;

    const { latitude, longitude } = geoData.results[0];

    // 2. Forecast vs Historical
    const diffDays = getDaysDiff(dateStr);

    let url = '';
    let isHistorical = false;

    // Open-Meteo forecast is usually good for ~14-16 days
    if (diffDays >= -1 && diffDays <= 14) {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;
    } else {
      isHistorical = true;
      const targetDate = new Date(dateStr);
      let refYear = targetDate.getFullYear() - 1;
      // Ensure we don't try to fetch future archive if users pick very far future
      if (refYear > new Date().getFullYear()) {
        refYear = new Date().getFullYear() - 1;
      }
      // Construct date string manually to avoid timezone shifts
      const refDateStr = `${refYear}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${refDateStr}&end_date=${refDateStr}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    }

    const weatherRes = await fetch(url);
    const weatherData = await weatherRes.json();

    if (!weatherData.daily || !weatherData.daily.time || weatherData.daily.time.length === 0) return null;

    const code = weatherData.daily.weather_code[0];
    const max = weatherData.daily.temperature_2m_max[0];
    const min = weatherData.daily.temperature_2m_min[0];

    return {
      tempMin: Math.round(min),
      tempMax: Math.round(max),
      condition: mapWmoCodeToCondition(code),
      isReference: isHistorical
    };

  } catch (error) {
    console.error("Error fetching day weather:", error);
    return null;
  }
};

// --- Activity Forecast (Specific Time) ---
export const fetchActivityWeather = async (location: string, dateStr: string, timeStr: string): Promise<WeatherData | null> => {
  try {
    const hour = parseHourFromTime(timeStr);
    // If we can't determine a specific hour, allow fallback to daily (handled by caller or return null here)
    if (hour === null) {
      return fetchWeatherForDay(location, dateStr);
    }

    const city = extractCityName(location);
    if (!city) return null;

    // 1. Geocoding
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`);
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) return null;
    const { latitude, longitude } = geoData.results[0];

    // 2. Forecast vs Historical
    const diffDays = getDaysDiff(dateStr);

    let url = '';
    let isHistorical = false;
    
    if (diffDays >= -1 && diffDays <= 14) {
      // Forecast Hourly
      url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;
    } else {
      // Historical Hourly
      isHistorical = true;
      const targetDate = new Date(dateStr);
      let refYear = targetDate.getFullYear() - 1;
      if (refYear > new Date().getFullYear()) refYear = new Date().getFullYear() - 1;
      
      const fetchDateStr = `${refYear}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${fetchDateStr}&end_date=${fetchDateStr}&hourly=temperature_2m,weather_code&timezone=auto`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.hourly || !data.hourly.time) return null;

    // The API returns 24 hours starting from 00:00 for the requested date
    // API is usually in local time requested by timezone=auto which defaults to GMT if not handled well, 
    // but OpenMeteo timezone=auto tries to match the location's timezone.
    // However, our `hour` input is just 0-23. We map it directly to the index.
    const index = hour; 
    
    // Safety check
    if (!data.hourly.temperature_2m || index >= data.hourly.temperature_2m.length) return null;

    const temp = data.hourly.temperature_2m[index];
    const code = data.hourly.weather_code[index];

    return {
      temp: Math.round(temp),
      condition: mapWmoCodeToCondition(code),
      isReference: isHistorical
    };

  } catch (error) {
    console.error("Error fetching activity weather:", error);
    return null;
  }
};
