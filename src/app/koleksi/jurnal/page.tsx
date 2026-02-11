'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import BookCard from '@/components/ui/BookCard';
import FloatingFilter from '@/components/ui/FloatingFilter';
import { fetchBooksAction } from '@/app/actions';
import { Book } from '@/lib/api/books';
import { getDepartments } from '@/app/actions/departments';



const ITEMS_PER_PAGE = 12;

function JurnalContent() {
    const searchParams = useSearchParams();
    const [journals, setJournals] = useState<Book[]>([]);
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
        async function fetchJournals() {
            setIsLoading(true);
            try {
                const result = await fetchBooksAction('jurnal', {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    filter: filter,
                    sort: sort as 'relevance' | 'newest',
                });
                setJournals(result.books);
                setTotalItems(result.totalItems);
            } catch (error) {
                console.error('Error fetching journals:', error);
                setJournals([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchJournals();
    }, [filter, sort, currentPage, year]);

    const totalPages = Math.min(Math.ceil(totalItems / ITEMS_PER_PAGE), 10);

    // Handlers removed

    return (
        <div className="min-h-screen pt-24">
            <section className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-gray-900 py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="badge-secondary mb-4">📄 Publikasi Ilmiah</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                            Jurnal Ilmiah
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            Akses jurnal ilmiah nasional dan internasional
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
                                <>Menampilkan <span className="font-semibold text-primary-900 dark:text-white">{totalItems.toLocaleString()}</span> jurnal</>
                            )}
                        </p>
                    </div>

                    {/* Journals Grid */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Memuat jurnal...</p>
                        </div>
                    ) : journals.length > 0 ? (
                        <div className="books-grid">
                            {journals.map((journal) => (
                                <BookCard key={journal.id} {...journal} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Tidak ada jurnal ditemukan
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
                                                ? 'bg-purple-500 text-white'
                                                : page === '...'
                                                    ? 'bg-transparent text-gray-400 cursor-default'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default function JurnalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <JurnalContent />
        </Suspense>
    );
}
