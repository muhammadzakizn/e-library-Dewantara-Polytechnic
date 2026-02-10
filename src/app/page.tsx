import Link from 'next/link';
import {
    BookOpen,
    FileText,
    GraduationCap,
    Briefcase,
    ArrowRight,
    Users,
    BookMarked,
    Download,
    Star
} from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import StatCard from '@/components/ui/StatCard';
import FeaturedBooks from '@/components/sections/FeaturedBooks';
import { getRealtimeStats } from '@/lib/api/books';

// FeaturedBooks component will fetch real books from API

const categories = [
    {
        name: 'Buku Digital',
        href: '/koleksi/buku-digital',
        icon: BookOpen,
        count: 1250,
        color: 'from-blue-500 to-blue-600',
        description: 'Koleksi buku digital berbagai bidang ilmu',
    },
    {
        name: 'Jurnal',
        href: '/koleksi/jurnal',
        icon: FileText,
        count: 450,
        color: 'from-purple-500 to-purple-600',
        description: 'Jurnal ilmiah nasional dan internasional',
    },
    {
        name: 'Modul & Bahan Ajar',
        href: '/koleksi/modul',
        icon: GraduationCap,
        count: 320,
        color: 'from-green-500 to-green-600',
        description: 'Modul pembelajaran mata kuliah',
    },
    {
        name: 'Laporan Magang',
        href: '/koleksi/laporan-magang',
        icon: Briefcase,
        count: 890,
        color: 'from-orange-500 to-orange-600',
        description: 'Arsip laporan magang mahasiswa',
    },
];


export default async function HomePage() {
    const statsData = await getRealtimeStats();

    const stats = [
        {
            label: 'Buku Digital',
            value: statsData.totalBooks,
            icon: <BookOpen className="w-6 h-6 text-secondary-500 dark:text-secondary-400" />
        },
        {
            label: 'Jurnal Ilmiah',
            value: statsData.totalJournals,
            icon: <FileText className="w-6 h-6 text-secondary-500 dark:text-secondary-400" />
        },
        {
            label: 'Modul Ajar',
            value: statsData.totalModules,
            icon: <GraduationCap className="w-6 h-6 text-secondary-500 dark:text-secondary-400" />
        },
        {
            label: 'Pengguna Aktif',
            value: statsData.activeUsers,
            icon: <Users className="w-6 h-6 text-secondary-500 dark:text-secondary-400" />
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section
                className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-slate-100 to-white dark:from-primary-900 dark:via-primary-800 dark:to-primary-700"
            >
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-secondary-400/30 dark:bg-secondary-400/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/30 dark:bg-primary-300/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-100/50 dark:bg-white/5 rounded-full blur-3xl" />
                </div>

                <div className="container-custom relative z-10 py-32">
                    {/* Text Content - Centered */}
                    <div className="max-w-4xl mx-auto text-center mb-10">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 dark:bg-white/10 backdrop-blur-sm rounded-full text-primary-700 dark:text-white/90 text-sm mb-8 animate-fade-in border border-primary-200 dark:border-white/20">
                            <BookOpen className="w-4 h-4" />
                            <span>Perpustakaan Digital Politeknik Dewantara</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-800 dark:text-white mb-6 leading-tight animate-slide-up">
                            Jelajahi Dunia Pengetahuan
                            <span className="block text-secondary-500 dark:text-secondary-400">Tanpa Batas</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg md:text-xl text-primary-600/80 dark:text-white/80 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Akses ribuan buku digital, jurnal ilmiah, modul pembelajaran,
                            dan laporan magang kapan saja, di mana saja.
                        </p>
                    </div>

                    {/* Search Bar - Full Width */}
                    <div className="max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <SearchBar />
                    </div>

                    {/* Quick Stats - Full Width Grid */}
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        {stats.map((stat, index) => (
                            <StatCard
                                key={stat.label}
                                icon={stat.icon}
                                value={stat.value}
                                label={stat.label}
                                delay={0.4 + (index * 0.1)}
                            />
                        ))}
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-auto"
                    >
                        <path
                            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                            className="fill-[var(--background)]"
                        />
                    </svg>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-[var(--background)]">
                <div className="container-custom">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="section-title">Jelajahi Koleksi Kami</h2>
                        <p className="section-subtitle mx-auto">
                            Temukan berbagai kategori koleksi digital yang dapat membantu
                            perjalanan akademik Anda
                        </p>
                    </div>

                    {/* Categories Grid */}
                    <div className="categories-grid">
                        {categories.map((category, index) => (
                            <Link
                                key={category.name}
                                href={category.href}
                                className="card-hover group p-6 text-center"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <category.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {category.description}
                                </p>
                                <p className="text-2xl font-bold text-primary-500">
                                    {category.count.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">koleksi tersedia</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Books Section */}
            <section className="py-20 bg-[var(--background-secondary)]">
                <div className="container-custom">
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
                        <div>
                            <h2 className="section-title">Koleksi Populer</h2>
                            <p className="section-subtitle">
                                Buku dan materi pembelajaran paling banyak dibaca
                            </p>
                        </div>
                        <Link
                            href="/koleksi"
                            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium group"
                        >
                            Lihat Semua
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Books Grid - Fetched from API */}
                    <FeaturedBooks query="buku bisnis indonesia" limit={6} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[var(--background)]">
                <div className="container-custom">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-10 md:p-16">
                        {/* Decorative */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Mulai Perjalanan Belajar Anda
                            </h2>
                            <p className="text-lg text-white/80 mb-8">
                                Daftar sekarang untuk mengakses seluruh koleksi perpustakaan digital,
                                menyimpan favorit, dan melacak riwayat bacaan Anda.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/daftar" className="btn-secondary">
                                    Daftar Sekarang
                                </Link>
                                <Link href="/panduan" className="btn bg-white/10 text-white hover:bg-white/20 border border-white/20">
                                    Pelajari Lebih Lanjut
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-[var(--background-secondary)]">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="section-title">Fitur Unggulan</h2>
                        <p className="section-subtitle mx-auto">
                            Nikmati pengalaman membaca digital yang nyaman dan modern
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '📚',
                                title: 'E-Reader Modern',
                                description: 'Baca buku dengan tampilan yang nyaman, lengkap dengan fitur bookmark dan catatan',
                            },
                            {
                                icon: '🔍',
                                title: 'Pencarian Cerdas',
                                description: 'Temukan buku dengan mudah menggunakan fitur pencarian dan filter yang lengkap',
                            },
                            {
                                icon: '📱',
                                title: 'Akses Di Mana Saja',
                                description: 'Baca koleksi perpustakaan dari perangkat apa saja, kapan saja',
                            },
                        ].map((feature, index) => (
                            <div
                                key={feature.title}
                                className="card p-8 text-center hover:shadow-hover transition-shadow"
                            >
                                <span className="text-5xl mb-4 block">{feature.icon}</span>
                                <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
