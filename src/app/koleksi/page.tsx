'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { BookOpen, FileText, GraduationCap, Briefcase, ArrowRight, Search as SearchIcon, Loader2 } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import BookCard from '@/components/ui/BookCard';
import { searchBooks, getTrendingBooks, Book } from '@/lib/api/books';

const categories = [
    {
        name: 'Buku Digital',
        href: '/koleksi/buku-digital',
        icon: BookOpen,
        color: 'from-blue-500 to-blue-600',
        description: 'Koleksi buku digital berbagai bidang ilmu',
    },
    {
        name: 'Jurnal',
        href: '/koleksi/jurnal',
        icon: FileText,
        color: 'from-purple-500 to-purple-600',
        description: 'Jurnal ilmiah nasional dan internasional',
    },
    {
        name: 'Modul & Bahan Ajar',
        href: '/koleksi/modul',
        icon: GraduationCap,
        color: 'from-green-500 to-green-600',
        description: 'Modul pembelajaran mata kuliah',
    },
    {
        name: 'Laporan Magang',
        href: '/koleksi/laporan-magang',
        icon: Briefcase,
        color: 'from-orange-500 to-orange-600',
        description: 'Arsip laporan magang mahasiswa',
    },
];

export default function KoleksiPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        }>
            <KoleksiContent />
        </Suspense>
    );
}

function KoleksiContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    // Fetch trending books on mount
    useEffect(() => {
        async function fetchTrending() {
            const books = await getTrendingBooks('id');
            setTrendingBooks(books);
        }
        fetchTrending();
    }, []);

    // Search when query changes
    useEffect(() => {
        async function performSearch() {
            if (!query) {
                setSearchResults([]);
                setTotalResults(0);
                return;
            }

            setIsLoading(true);
            try {
                const result = await searchBooks(query, { limit: 20 });
                setSearchResults(result.books);
                setTotalResults(result.totalItems);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }

        performSearch();
    }, [query]);

    return (
        <div className="min-h-screen pt-24">
            {/* Header */}
            <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/50 dark:to-gray-900 py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                            Koleksi Perpustakaan
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            Temukan berbagai sumber belajar dari koleksi digital kami
                        </p>
                        <SearchBar />
                    </div>
                </div>
            </section>

            {/* Search Results - Show when there's a query */}
            {query && (
                <section className="py-16">
                    <div className="container-custom">
                        <div className="flex items-center gap-3 mb-8">
                            <SearchIcon className="w-6 h-6 text-primary-500" />
                            <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                                Hasil Pencarian: &quot;{query}&quot;
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">Mencari buku...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Ditemukan {totalResults} hasil dari Open Library & Google Books
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {searchResults.map((book) => (
                                        <BookCard
                                            key={book.id}
                                            id={book.id}
                                            title={book.title}
                                            author={book.author}
                                            coverUrl={book.coverUrl}
                                            category={book.category}
                                            year={book.year}
                                            views={book.views}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <SearchIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Tidak ada hasil untuk &quot;{query}&quot;
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Coba kata kunci lain atau jelajahi kategori di bawah
                                </p>
                                <Link
                                    href="/koleksi"
                                    className="btn-primary inline-flex"
                                >
                                    Lihat Semua Koleksi
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Categories - Always show */}
            <section className={`py-16 ${query ? 'bg-[var(--background-secondary)]' : ''}`}>
                <div className="container-custom">
                    <h2 className="section-title mb-8">Kategori Koleksi</h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={category.href}
                                className="card-hover group p-6"
                            >
                                <div className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <category.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {category.description}
                                </p>
                                <div className="flex items-center justify-end">
                                    <span className="text-sm font-semibold text-primary-500 group-hover:underline flex items-center gap-1">
                                        Lihat Koleksi
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Books - Only show when not searching */}
            {!query && (
                <section className="py-16 bg-[var(--background-secondary)]">
                    <div className="container-custom">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="section-title">Buku Populer</h2>
                                <p className="section-subtitle">Koleksi buku yang sedang trending</p>
                            </div>
                        </div>

                        {trendingBooks.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {trendingBooks.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        id={book.id}
                                        title={book.title}
                                        author={book.author}
                                        coverUrl={book.coverUrl}
                                        category={book.category}
                                        year={book.year}
                                        views={book.views}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
