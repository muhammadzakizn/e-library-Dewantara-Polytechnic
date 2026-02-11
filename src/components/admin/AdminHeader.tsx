'use client';

import { useState, useEffect } from 'react';
import {
    Bell, Sun, Cloud, CloudRain, CloudSun,
} from 'lucide-react';

interface WeatherData {
    temp: number;
    condition: string;
    location: string;
}

const greetings = {
    pagi: ["Semangat Pagi ☀️", "Awali dengan senyuman 😊", "Siap produktif hari ini? 🚀", "Jangan lupa sarapan ☕"],
    siang: ["Tetap semangat 💪", "Jangan lupa istirahat 🍱", "Lanjutkan kerja bagus 👍", "Tetap fokus 🎯"],
    sore: ["Hampir selesai 🌅", "Review hari ini 📝", "Persiapan pulang 🏡", "Tetap energik ⚡"],
    malam: ["Selamat beristirahat 🌙", "Jangan lupa save pekerjaan 💾", "Lembur? Semangat! 🦉", "Mimpi indah 💤"]
};

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
    const [subGreeting, setSubGreeting] = useState('');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now);

            const hour = now.getHours();
            let mainGreet = 'Selamat Malam';

            if (hour >= 5 && hour < 11) { mainGreet = 'Selamat Pagi'; }
            else if (hour >= 11 && hour < 15) { mainGreet = 'Selamat Siang'; }
            else if (hour >= 15 && hour < 18) { mainGreet = 'Selamat Sore'; }

            setGreeting(mainGreet);
        };

        updateTime();
        const timer = setInterval(updateTime, 1000);

        // Set random sub-greeting
        const hour = new Date().getHours();
        let timeKey: keyof typeof greetings = 'malam';
        if (hour >= 5 && hour < 11) timeKey = 'pagi';
        else if (hour >= 11 && hour < 15) timeKey = 'siang';
        else if (hour >= 15 && hour < 18) timeKey = 'sore';

        const randomMsg = greetings[timeKey][Math.floor(Math.random() * greetings[timeKey].length)];
        setSubGreeting(randomMsg);

        // Simulated Weather
        setWeather({
            temp: 28,
            condition: 'Cloudy',
            location: 'Politeknik Dewantara'
        });

        return () => clearInterval(timer);
    }, []);

    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'rain': return <CloudRain className="w-8 h-8 text-white/90 drop-shadow-md" />;
            case 'clear': return <Sun className="w-8 h-8 text-yellow-300 drop-shadow-md" />;
            case 'cloudy': return <Cloud className="w-8 h-8 text-gray-200 drop-shadow-md" />;
            default: return <CloudSun className="w-8 h-8 text-yellow-100 drop-shadow-md" />;
        }
    };

    if (!mounted || !currentTime) return null;

    // Split time parts for formatting
    const timeString = currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const [time, ampm] = timeString.split(' ');
    const [hh, mm, ss] = time.split(':');

    return (
        <header className="px-6 lg:px-8 py-6 mb-2 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            {/* Left: User Info */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium animate-fade-in">
                    <span>{greeting}, {subGreeting}</span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {user?.full_name || 'Administrator'}
                </h1>

                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="capitalize font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800">
                        {user?.role || 'Admin'}
                    </span>

                    {/* Only show department for Dosen/Mahasiswa */}
                    {(user?.role === 'dosen' || user?.role === 'mahasiswa') && user?.program_studi && (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                                {user.program_studi}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Time & Weather Widget */}
            <div className="flex items-center gap-6">
                {/* Clock & Weather Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20 p-6 min-w-[300px] group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-600/30">

                    {/* Background Animation (Weather) */}
                    <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-all duration-1000 rotate-12 group-hover:rotate-45">
                        <CloudSun className="w-48 h-48" />
                    </div>
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px] group-hover:bg-white/10 transition-colors" />

                    <div className="relative z-10 flex justify-between items-center">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-bold text-blue-200 mb-0.5 uppercase tracking-widest">
                                Local Time
                            </p>
                            <div className="flex items-baseline mb-2">
                                <span className="text-4xl font-bold font-mono tracking-tighter tabular-nums text-white drop-shadow-sm">
                                    {hh}:{mm}
                                </span>
                                <span className="text-xl font-medium font-mono text-blue-200 ml-1 w-6">
                                    {ss}
                                </span>
                                <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded text-white ml-2 backdrop-blur-sm">
                                    {ampm}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-blue-100 opacity-90">
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="flex flex-col items-end pl-6 border-l border-white/10">
                            <div className="animate-float">
                                {weather && getWeatherIcon(weather.condition)}
                            </div>
                            <div className="flex items-start mt-1">
                                <span className="text-2xl font-bold leading-none">{weather?.temp}°</span>
                                <span className="text-xs mt-1 opacity-70">C</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-blue-200 mt-1 tracking-wider text-right max-w-[80px] leading-tight">
                                {weather?.location.split(' ')[0]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <button className="h-14 w-14 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-900 shadow-sm hover:shadow-lg flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-all relative group">
                    <Bell className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-ping" />
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                </button>
            </div>
        </header>
    );
}
