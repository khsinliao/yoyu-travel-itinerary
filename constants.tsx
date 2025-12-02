
import { DayItinerary, ActivityType } from './types';
import { Plane, Building, MapPin, Train } from 'lucide-react';
import React from 'react';

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const INITIAL_ITINERARY: DayItinerary[] = [
  {
    id: 'day-1',
    date: '2026-02-03',
    displayDate: '2/3 (二)',
    location: '台北 ➔ 東京',
    weatherInfo: { tempMin: 5, tempMax: 12, condition: 'Cloudy', isReference: true },
    activities: [
      {
        id: generateId(),
        time: 'TBA',
        title: '桃園機場第一航廈 🔜 🇯🇵',
        type: ActivityType.FLIGHT,
        description: '航班編號 IT200',
        location: 'Taoyuan International Airport',
        weatherInfo: { temp: 18, condition: 'Cloudy', isReference: true },
        todos: [
          { id: generateId(), text: '訂機場接送', completed: false },
          { id: generateId(), text: 'Skyline 車票預訂', completed: false }
        ]
      },
      {
        id: generateId(),
        time: 'Evening',
        title: '住宿：日暮里阿爾蒙特飯店',
        location: 'Arakawa City, Tokyo',
        type: ActivityType.HOTEL,
        weatherInfo: { temp: 8, condition: 'Cloudy', isReference: true },
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=Almont+Hotel+Nippori'
      }
    ]
  },
  {
    id: 'day-2',
    date: '2026-02-04',
    displayDate: '2/4 (三)',
    location: '東京 ➔ 草津',
    weatherInfo: { tempMin: -2, tempMax: 4, condition: 'Snow', isReference: true },
    activities: [
      {
        id: generateId(),
        time: 'Morning',
        title: '前往輕井澤',
        type: ActivityType.TRANSPORT,
        description: '搭乘新幹線前往輕井澤',
        weatherInfo: { temp: 2, condition: 'Sunny', isReference: true },
        todos: [{ id: generateId(), text: '訂新幹線（11/2開放訂）', completed: false }]
      },
      {
        id: generateId(),
        time: 'Afternoon',
        title: '草津溫泉 湯畑',
        location: 'Kusatsu, Gunma',
        type: ActivityType.ACTIVITY,
        weatherInfo: { temp: -1, condition: 'Snow', isReference: true },
        description: '體驗在河畔小攤吃拉麵的獨特氛圍',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=Kusatsu+Onsen+Yubatake'
      },
       {
        id: generateId(),
        time: 'Night',
        title: '住宿：草津周邊',
        type: ActivityType.HOTEL,
        weatherInfo: { temp: -3, condition: 'Snow', isReference: true },
        todos: [{ id: generateId(), text: '預訂草津住宿', completed: false }]
      }
    ]
  },
  {
    id: 'day-3',
    date: '2026-02-05',
    displayDate: '2/5 (四)',
    location: '草津',
    weatherInfo: { tempMin: -5, tempMax: 2, condition: 'Snow', isReference: true },
    activities: [
      {
        id: generateId(),
        time: 'All Day',
        title: '草津滑雪 ⛷️',
        location: '草津溫泉滑雪場',
        type: ActivityType.ACTIVITY,
        weatherInfo: { tempMin: -6, tempMax: -1, condition: 'Snow', isReference: true },
        description: 'Kusatsu, Gunma, Agatsuma District',
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=Kusatsu+Onsen+Ski+Resort'
      }
    ]
  },
  {
    id: 'day-4',
    date: '2026-02-06',
    displayDate: '2/6 (五)',
    location: '草津 ➔ 長野',
    weatherInfo: { tempMin: 0, tempMax: 6, condition: 'Cloudy', isReference: true },
    activities: [
      {
        id: generateId(),
        time: 'Daytime',
        title: '前往長野',
        type: ActivityType.TRANSPORT,
      },
      {
        id: generateId(),
        time: 'Afternoon',
        title: '善光寺',
        location: 'Nagano, Nagano',
        type: ActivityType.ACTIVITY,
        weatherInfo: { temp: 4, condition: 'Cloudy', isReference: true },
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=Zenkoji+Nagano'
      },
      {
        id: generateId(),
        time: 'Night',
        title: '住宿：長野市',
        type: ActivityType.HOTEL,
        weatherInfo: { temp: 1, condition: 'Cloudy', isReference: true },
      }
    ]
  },
  {
    id: 'day-5',
    date: '2026-02-07',
    displayDate: '2/7 (六)',
    location: '長野 (戶隱)',
    weatherInfo: { tempMin: -3, tempMax: 3, condition: 'Snow', isReference: true },
    activities: [
      {
        id: generateId(),
        time: 'Morning',
        title: '戶隱神社 奥社 ⛩️',
        location: 'Nagano, Nagano',
        type: ActivityType.ACTIVITY,
        weatherInfo: { temp: -2, condition: 'Snow', isReference: true },
        googleMapLink: 'https://www.google.com/maps/search/?api=1&query=Togakushi+Shrine'
      }
    ]
  },
  {
    id: 'day-6',
    date: '2026-02-08',
    displayDate: '2/8 (日)',
    location: '長野 ➔ 富山 (合掌村)',
    weatherInfo: { tempMin: 2, tempMax: 8, condition: 'Cloudy', isReference: true },
    activities: [
      {
        id: generateId(),
        time: '07:38',
        title: '新幹線 🚄 長野 ➔ 富山',
        type: ActivityType.TRANSPORT,
        description: '08:23 抵達富山'
      },
      {
        id: generateId(),
        time: '09:00',
        title: '濃飛巴士 🚌 富山 ➔ 白川鄉',
        type: ActivityType.TRANSPORT,
        description: '10:20 抵達白川鄉'
      },
      {
        id: generateId(),
        time: '10:20 - 15:20',
        title: '白川鄉合掌村 散策',
        location: 'Shirakawa-go',
        type: ActivityType.ACTIVITY,
        weatherInfo: { temp: 3, condition: 'Cloudy', isReference: true },
        description: '記得寄存行李'
      },
      {
        id: generateId(),
        time: '15:20',
        title: '濃飛巴士 🚌 白川鄉 ➔ 富山站',
        type: ActivityType.TRANSPORT,
        description: '16:50 抵達'
      },
      {
        id: generateId(),
        time: 'Night',
        title: '住宿：富士市/富山',
        type: ActivityType.HOTEL,
      }
    ]
  },
   {
    id: 'day-7',
    date: '2026-02-09',
    displayDate: '2/9 (一)',
    location: '富山 ➔ 東京',
    weatherInfo: { tempMin: 4, tempMax: 11, condition: 'Sunny', isReference: true },
    activities: [
      {
        id: generateId(),
        time: 'Morning',
        title: '富山 ✈️ 東京羽田 (或新幹線)',
        type: ActivityType.TRANSPORT,
        todos: [{id: generateId(), text: '訂新幹線/機票', completed: false}]
      },
      {
        id: generateId(),
        time: 'Afternoon',
        title: '新宿逛街',
        location: 'Shinjuku',
        type: ActivityType.ACTIVITY,
        weatherInfo: { temp: 10, condition: 'Sunny', isReference: true },
      }
    ]
  },
  {
    id: 'day-8',
    date: '2026-02-10',
    displayDate: '2/10 (二)',
    location: '東京 ➔ 台北',
    weatherInfo: { tempMin: 5, tempMax: 13, condition: 'Sunny', isReference: true },
    activities: [
      {
        id: generateId(),
        time: 'Daytime',
        title: '原宿、澀谷',
        type: ActivityType.ACTIVITY,
        location: 'Harajuku',
        weatherInfo: { temp: 12, condition: 'Sunny', isReference: true },
      },
      {
        id: generateId(),
        time: 'TBA',
        title: '返程 ✈️ TPE',
        type: ActivityType.FLIGHT,
      }
    ]
  }
];

export const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.FLIGHT: return <Plane className="w-4 h-4" />;
    case ActivityType.HOTEL: return <Building className="w-4 h-4" />;
    case ActivityType.TRANSPORT: return <Train className="w-4 h-4" />;
    case ActivityType.ACTIVITY: return <MapPin className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};
