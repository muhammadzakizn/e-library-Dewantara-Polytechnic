'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    BookOpen,
    Clock,
    Heart,
    Upload,
    ChevronRight,
    TrendingUp,
    BookMarked,
    User,
    LogOut,
    Settings,
    Loader2,
    FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function DashboardPage() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        let mounted = true;
        const supabase = createClient();

        // Listen for auth state changes — this is reactive and never hangs
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!mounted) return;

                if (session?.user) {
                    setUser(session.user);
                    setIsLoading(false);
                } else {
                    // No session — redirect to login
                    setUser(null);
                    setIsLoading(false);
                }
            }
        );

        // Also do an immediate check with getSession (cached, instant)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            if (session?.user) {
                setUser(session.user);
            }
            setIsLoading(false);
        }).catch(() => {
            if (mounted) setIsLoading(false);
        });

        // Ultimate safety: force stop loading after 3 seconds no matter what
        const safetyTimer = setTimeout(() => {
            if (mounted) setIsLoading(false);
        }, 3000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna';
    const userEmail = user?.email || '';
    const userAvatar = user?.user_metadata?.avatar_url || null;
    const userNim = user?.user_metadata?.nim || '';
    const userProdi = user?.user_metadata?.program_studi || '';

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-[var(--background-secondary)] flex items-center justify-center">
                <div className="text-center flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                    <p className="text-gray-500">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[var(--background-secondary)]">
            <div className="container-custom">
                {/* Header with Profile */}
                <div className="mb-8 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Profile Photo */}
                        <div className="relative">
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-16 h-16 rounded-2xl object-cover shadow-md"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
                                    <span className="text-2xl font-bold text-white">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primary-900 dark:text-white">
                                Selamat Datang, {userName}! 👋
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {userProdi ? `${userProdi} • ` : ''}{userEmail}
                            </p>
                        </div>
                    </div>

                    {/* Profile Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Settings className="w-5 h-5 text-gray-500" />
                        </button>
                        {showProfileMenu && (
                            <div className="absolute right-0 top-12 w-56 card p-2 shadow-xl z-50">
                                <Link
                                    href="/dashboard/pengaturan"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <Settings className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Pengaturan</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm">Keluar</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid - Start from zero */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: BookOpen, label: 'Buku Dibaca', value: '0' },
                        { icon: Clock, label: 'Jam Membaca', value: '0' },
                        { icon: Heart, label: 'Favorit', value: '0' },
                        { icon: TrendingUp, label: 'Streak', value: '0 hari' },
                    ].map((stat) => (
                        <div key={stat.label} className="card p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 text-primary-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Continue Reading - Empty State */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-primary-900 dark:text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Lanjutkan Membaca
                                </h2>
                                <Link href="/dashboard/riwayat" className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1">
                                    Lihat Semua <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Belum ada buku yang dibaca
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Mulai jelajahi koleksi dan baca buku pertama Anda
                                </p>
                                <Link href="/koleksi" className="btn-primary inline-flex items-center gap-2">
                                    <BookMarked className="w-4 h-4" />
                                    Jelajahi Koleksi
                                </Link>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Link
                                href="/dashboard/unggah-laporan"
                                className="card p-6 hover:shadow-hover transition-shadow group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                                        <Upload className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-primary-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                            Upload Laporan Magang
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Unggah laporan magang Anda
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/laporan-saya"
                                className="card p-6 hover:shadow-hover transition-shadow group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                                        <FileText className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-primary-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                            Laporan Saya
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Kelola laporan yang diupload
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/koleksi"
                                className="card p-6 hover:shadow-hover transition-shadow group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                                        <BookMarked className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-primary-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                            Jelajahi Koleksi
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Temukan buku baru
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <div className="card p-6">
                            <div className="text-center">
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 shadow-md"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-md">
                                        <span className="text-3xl font-bold text-white">
                                            {userName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <h3 className="font-bold text-primary-900 dark:text-white">{userName}</h3>
                                {userNim && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">NIM: {userNim}</p>
                                )}
                                {userProdi && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{userProdi}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">{userEmail}</p>
                                <Link
                                    href="/dashboard/pengaturan"
                                    className="btn-secondary w-full mt-4 inline-flex items-center justify-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Pengaturan
                                </Link>
                            </div>
                        </div>

                        {/* Collections Widget */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-primary-900 dark:text-white flex items-center gap-2">
                                    <BookMarked className="w-5 h-5 text-blue-500" />
                                    Koleksi Saya
                                </h2>
                                <Link
                                    href="/dashboard/koleksi"
                                    className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                                >
                                    Lihat Semua
                                </Link>
                            </div>
                            <div className="text-center py-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    Kelola koleksi buku Anda
                                </p>
                                <Link
                                    href="/dashboard/koleksi"
                                    className="btn-secondary w-full text-xs"
                                >
                                    Buka Koleksi
                                </Link>
                            </div>
                        </div>

                        {/* Favorites Widget */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-primary-900 dark:text-white flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-500" />
                                    Favorit
                                </h2>
                                <Link
                                    href="/dashboard/favorit"
                                    className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                                >
                                    Lihat Semua
                                </Link>
                            </div>
                            <div className="text-center py-6">
                                <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Lihat buku yang Anda sukai
                                </p>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                            <h3 className="font-bold mb-2">💡 Tips</h3>
                            <p className="text-sm text-white/80">
                                Cari buku di halaman Koleksi, lalu klik &quot;Baca Sekarang&quot; untuk mulai membaca.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
