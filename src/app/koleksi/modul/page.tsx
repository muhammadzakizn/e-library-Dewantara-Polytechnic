'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, GraduationCap } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import BookCard from '@/components/ui/BookCard';
import FloatingFilter from '@/components/ui/FloatingFilter';
import { fetchBooksAction } from '@/app/actions';
import { Book } from '@/lib/api/books';

const categories = [
    // Jurusan
    { label: 'Teknologi Rekayasa Multimedia', value: 'Teknologi Rekayasa Multimedia' },
    { label: 'Teknologi Rekayasa Pangan', value: 'Teknologi Rekayasa Pangan' },
    { label: 'Teknologi Rekayasa Metalurgi', value: 'Teknologi Rekayasa Metalurgi' },
    { label: 'Arsitektur', value: 'Arsitektur' },
    { label: 'Teknik Sipil', value: 'Teknik Sipil' },
    { label: 'Teknik Elektronika', value: 'Teknik Elektronika' },
    { label: 'Teknik Mesin dan Otomotif', value: 'Teknik Mesin dan Otomotif' },
    // Semesters
    { label: 'Semester 1', value: 'Semester 1' },
    { label: 'Semester 2', value: 'Semester 2' },
    { label: 'Semester 3', value: 'Semester 3' },
    { label: 'Semester 4', value: 'Semester 4' },
    { label: 'Semester 5', value: 'Semester 5' },
    { label: 'Semester 6', value: 'Semester 6' },
    { label: 'Semester 7', value: 'Semester 7' },
    { label: 'Semester 8', value: 'Semester 8' },
];

const ITEMS_PER_PAGE = 12;

function ModulContent() {
    const searchParams = useSearchParams();
    const [modules, setModules] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const filter = searchParams.get('filter') || 'Semua';
    const sort = (searchParams.get('sort') as 'relevance' | 'newest') || 'relevance';
    const year = searchParams.get('year') || '';

    useEffect(() => {
        async function fetchModules() {
            setIsLoading(true);
            try {
                const result = await fetchBooksAction('modul', {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    filter: filter,
                    sort: sort as 'relevance' | 'newest',
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
    }, [filter, sort, currentPage, year]);

    const totalPages = Math.min(Math.ceil(totalItems / ITEMS_PER_PAGE), 10);

    // Handlers removed

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
                        <SearchBar showFilters />
                    </div>
                </div>
            </section>

            <section className="py-12 relative min-h-[500px]">
                <div className="container-custom">
                    {/* Results Info */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-500 dark:text-gray-400">
                            {isLoading ? (
                                'Memuat...'
                            ) : (
                                <>Menampilkan <span className="font-semibold text-primary-900 dark:text-white">{totalItems.toLocaleString()}</span> modul</>
                            )}
                        </p>
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

            <FloatingFilter
                categories={categories}
            />
        </div>
    );
}

export default function ModulPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <ModulContent />
        </Suspense>
    );
}
