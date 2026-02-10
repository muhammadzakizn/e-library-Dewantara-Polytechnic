'use client';

import { useState, useEffect } from 'react';
import { Loader2, GraduationCap } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import BookCard from '@/components/ui/BookCard';
import { fetchBooksAction } from '@/app/actions';
import { Book } from '@/lib/api/books';

const filters = ['Semua', 'Semester 1-2', 'Semester 3-4', 'Semester 5-6', 'Praktikum'];
const ITEMS_PER_PAGE = 12;

export default function ModulPage() {
    const [modules, setModules] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [sortBy, setSortBy] = useState<'relevance' | 'newest'>('relevance');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        async function fetchModules() {
            setIsLoading(true);
            try {
                const result = await fetchBooksAction('modul', {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    filter: activeFilter,
                    sort: sortBy,
                });
                setModules(result.books);
                setTotalItems(result.totalItems);
            } catch (error) {
                console.error('Error fetching modules:', error);
                setModules([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchModules();
    }, [activeFilter, sortBy, currentPage]);

    const totalPages = Math.min(Math.ceil(totalItems / ITEMS_PER_PAGE), 10);

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as 'relevance' | 'newest');
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen pt-24">
            <section className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-gray-900 py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="badge-success mb-4">📖 Bahan Pembelajaran</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                            Modul & Bahan Ajar
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            Modul dan materi pembelajaran untuk setiap mata kuliah
                        </p>
                        <SearchBar placeholder="Cari modul atau bahan ajar..." showFilters />
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="container-custom">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => handleFilterChange(filter)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === filter
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Results Info */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-500 dark:text-gray-400">
                            {isLoading ? (
                                'Memuat...'
                            ) : (
                                <>Menampilkan <span className="font-semibold text-primary-900 dark:text-white">{totalItems.toLocaleString()}</span> modul</>
                            )}
                        </p>
                        <select
                            className="input py-2 px-4 w-auto text-sm"
                            value={sortBy}
                            onChange={handleSortChange}
                        >
                            <option value="relevance">Terpopuler</option>
                            <option value="newest">Terbaru</option>
                        </select>
                    </div>

                    {/* Modules Grid */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Memuat modul...</p>
                        </div>
                    ) : modules.length > 0 ? (
                        <div className="books-grid">
                            {modules.map((module) => (
                                <BookCard key={module.id} {...module} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                            <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Tidak ada modul ditemukan
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
                                                ? 'bg-green-500 text-white'
                                                : page === '...'
                                                    ? 'bg-transparent text-gray-400 cursor-default'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
