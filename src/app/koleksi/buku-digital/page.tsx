'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, BookOpen } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import BookCard from '@/components/ui/BookCard';
import FloatingFilter from '@/components/ui/FloatingFilter';
import { fetchBooksAction } from '@/app/actions';
import { Book } from '@/lib/api/books';
import { getDepartments } from '@/app/actions/departments';



const ITEMS_PER_PAGE = 12;

function BukuDigitalContent() {
    const searchParams = useSearchParams();
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        getDepartments().then(depts => {
            setCategories(depts.map(d => ({ label: d.name, value: d.name })));
        });
    }, []);

    const filter = searchParams.get('filter') || 'Semua';
    const sort = (searchParams.get('sort') as 'relevance' | 'newest') || 'relevance';
    const year = searchParams.get('year') || '';

    useEffect(() => {
        async function fetchBooks() {
            setIsLoading(true);
            try {
                // If filter is active, we might want to reset page if it changed (handled by effect dependency?)
                // Actually reset page logic is tricky with just useEffect. 
                // For now, let's just fetch.

                const result = await fetchBooksAction('buku_digital', {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    filter: filter,
                    sort: sort as 'relevance' | 'newest',
                });
                setBooks(result.books);
                setTotalItems(result.totalItems);
            } catch (error) {
                console.error('Error fetching books:', error);
                setBooks([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBooks();
    }, [filter, sort, currentPage, year]);

    const totalPages = Math.min(Math.ceil(totalItems / ITEMS_PER_PAGE), 10);

    // Handlers removed, using FloatingFilter URLs

    return (
        <div className="min-h-screen pt-24">
            {/* Header */}
            <section className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-gray-900 py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="badge-primary mb-4">📚 Koleksi Digital</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                            Buku Digital
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            Jelajahi koleksi buku digital dari berbagai bidang ilmu
                        </p>
                        <SearchBar showFilters />
                    </div>
                </div>
            </section>

            {/* Filters & Content */}
            <section className="py-12 relative min-h-[500px]">
                <div className="container-custom">
                    {/* Results Info */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-500 dark:text-gray-400">
                            {isLoading ? (
                                'Memuat...'
                            ) : (
                                <>Menampilkan <span className="font-semibold text-primary-900 dark:text-white">{totalItems.toLocaleString()}</span> buku digital</>
                            )}
                        </p>
                    </div>

                    {/* Books Grid */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Memuat buku...</p>
                        </div>
                    ) : books.length > 0 ? (
                        <div className="books-grid">
                            {books.map((book) => (
                                <BookCard key={book.id} {...book} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Tidak ada buku ditemukan
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Coba filter atau kata kunci lain
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex justify-center mt-12">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sebelumnya
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        if (page === 1 || page === totalPages) return true;
                                        return Math.abs(page - currentPage) <= 1;
                                    })
                                    .reduce((pages: (number | string)[], page, index, arr) => {
                                        if (index > 0 && page - (arr[index - 1] as number) > 1) {
                                            pages.push('...');
                                        }
                                        pages.push(page);
                                        return pages;
                                    }, [])
                                    .map((page, index) => (
                                        <button
                                            key={index}
                                            onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                            disabled={page === '...'}
                                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === currentPage
                                                ? 'bg-primary-500 text-white'
                                                : page === '...'
                                                    ? 'bg-transparent text-gray-400 cursor-default'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <FloatingFilter
                categories={categories}
            />
        </div>
    );
}

export default function BukuDigitalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <BukuDigitalContent />
        </Suspense>
    );
}
