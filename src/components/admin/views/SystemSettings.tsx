'use client';

import { Settings, Moon, Sun, Image as ImageIcon, Palette, Layout } from 'lucide-react';

export default function SystemSettings() {
    return (
        <div className="max-w-4xl space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Sistem</h2>
                <p className="text-gray-500 dark:text-gray-400">Personalisasi tampilan dan konfigurasi dashboard.</p>
            </div>

            {/* Appearance */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Palette className="w-5 h-5 text-gray-900 dark:text-white" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tampilan</h3>
                </div>

                <div className="space-y-6">
                    {/* Theme Mode */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Mode Gelap</p>
                            <p className="text-sm text-gray-500">Sesuaikan tampilan dengan pencahayaan ruangan.</p>
                        </div>
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                            <button className="p-2 rounded-full bg-white dark:bg-gray-600 shadow-sm text-yellow-500">
                                <Sun className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-full text-gray-400 dark:text-gray-200">
                                <Moon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Background */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Latar Belakang Dashboard</p>
                                <p className="text-sm text-gray-500">Pilih gambar atau warna solid untuk background.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3].map((i) => (
                                <button key={i} className="aspect-video rounded-xl bg-gray-200 dark:bg-gray-700 hover:ring-2 ring-blue-500 transition-all overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                </button>
                            ))}
                            <button className="aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
                                <ImageIcon className="w-6 h-6 mb-2" />
                                <span className="text-xs font-medium">Upload</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Layout className="w-5 h-5 text-gray-900 dark:text-white" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Widget Beranda</h3>
                </div>

                <div className="space-y-3">
                    {['Statistik Pengguna', 'Laporan Terbaru', 'Cuaca Kampus', 'Kalender Akademik'].map((widget, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/10">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{widget}</span>
                            <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
