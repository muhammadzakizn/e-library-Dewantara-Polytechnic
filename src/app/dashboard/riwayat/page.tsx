'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Heart, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';

export default function RiwayatPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 bg-[var(--background-secondary)]">
            <div className="container-custom">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white">
                        Riwayat & Favorit
                    </h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Reading History */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Riwayat Bacaan
                        </h2>

                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Belum ada riwayat bacaan
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Mulai baca buku untuk melihat riwayat di sini
                            </p>
                            <Link href="/koleksi" className="btn-primary inline-flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Jelajahi Koleksi
                            </Link>
                        </div>
                    </div>

                    {/* Favorites */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-6 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            Koleksi Favorit
                        </h2>

                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Belum ada favorit
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Tandai buku favorit saat membaca
                            </p>
                            <Link href="/koleksi" className="btn-primary inline-flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Jelajahi Koleksi
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
