'use client';

import { useState, useEffect } from 'react';
import {
    Bell, Search, Moon, Sun, Cloud, CloudRain, CloudSun, CloudLightning,
    Wind, Droplets
} from 'lucide-react';

interface WeatherData {
    temp: number;
    condition: string; // 'Clear', 'Cloudy', 'Rain', etc.
    location: string;
}

export default function AdminHeader({
    title,
    user,
    settings
}: {
    title: string;
    user: any;
    settings?: any;
}) {
    const [greeting, setGreeting] = useState('');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Dynamic greeting
        const hour = new Date().getHours();
        if (hour < 11) setGreeting('Selamat Pagi');
        else if (hour < 15) setGreeting('Selamat Siang');
        else if (hour < 18) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');

        // Clock timer
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        // Simulated Weather (In real app, fetch from OpenMeteo)
        // Default to Jakarta/Campus location
        setWeather({
            temp: 28,
            condition: 'Cloudy',
            location: 'Politeknik Dewantara'
        });

        return () => clearInterval(timer);
    }, []);

    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'rain': return <CloudRain className="w-5 h-5 text-blue-400" />;
            case 'clear': return <Sun className="w-5 h-5 text-orange-400" />;
            case 'cloudy': return <Cloud className="w-5 h-5 text-gray-400" />;
            default: return <CloudSun className="w-5 h-5 text-yellow-400" />;
        }
    };

    return (
        <header className="h-24 px-8 flex items-center justify-between sticky top-0 z-40">
            {/* Glass Background */}
            <div className="absolute inset-x-4 top-4 bottom-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-3xl shadow-sm -z-10" />

            <div className="flex items-center gap-4 ml-6">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        {title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        {greeting}, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.full_name?.split(' ')[0] || 'Admin'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                        <span>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 mr-6">
                {/* Weather Widget */}
                {weather && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/20 dark:border-gray-700 hover:bg-white/80 transition-colors cursor-pointer group">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform">
                            {getWeatherIcon(weather.condition)}
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{weather.location}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                {weather.temp}°C
                            </p>
                        </div>
                    </div>
                )}

                {/* Notifications */}
                <button className="w-10 h-10 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900" />
                </button>
            </div>
        </header>
    );
}
