

export type Currency = 'JPY' | 'TWD';

export enum ActivityType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  ACTIVITY = 'ACTIVITY',
  TRANSPORT = 'TRANSPORT',
  FOOD = 'FOOD'
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WeatherData {
  tempMin?: number; 
  tempMax?: number;
  temp?: number;    // Specific temperature for a time point
  condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Snow';
  isReference?: boolean; 
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  location?: string;
  description?: string;
  type: ActivityType;
  googleMapLink?: string;
  todos?: TodoItem[];
  notes?: string;
  weatherInfo?: WeatherData; 
}

export interface DayItinerary {
  id: string;
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "2/3 (Mon)"
  location: string;
  subtitle?: string;
  weatherInfo?: WeatherData;
  activities: ItineraryItem[];
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  category: string; // Food, Transport, Shopping, Accommodation
  description: string;
}

export interface AppState {
  itinerary: DayItinerary[];
  expenses: Expense[];
}