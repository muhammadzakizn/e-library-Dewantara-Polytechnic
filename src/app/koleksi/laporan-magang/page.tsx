'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Briefcase, Upload, Calendar, Building, Loader2, BookOpen } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import FloatingFilter from '@/components/ui/FloatingFilter';
import { fetchBooksAction } from '@/app/actions';
import { Book } from '@/lib/api/books';

const categories = [
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: 'Teknologi Rekayasa Multimedia', value: 'Teknologi Rekayasa Multimedia' },
    { label: 'Teknologi Rekayasa Pangan', value: 'Teknologi Rekayasa Pangan' },
    { label: 'Teknologi Rekayasa Metalurgi', value: 'Teknologi Rekayasa Metalurgi' },
    { label: 'Arsitektur', value: 'Arsitektur' },
    { label: 'Teknik Sipil', value: 'Teknik Sipil' },
    { label: 'Teknik Elektronika', value: 'Teknik Elektronika' },
    { label: 'Teknik Mesin dan Otomotif', value: 'Teknik Mesin dan Otomotif' },
];

const ITEMS_PER_PAGE = 10;

function LaporanMagangContent() {
    const searchParams = useSearchParams();
    const [reports, setReports] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const filter = searchParams.get('filter') || 'Semua';
    const sort = (searchParams.get('sort') as 'relevance' | 'newest') || 'relevance';
    const year = searchParams.get('year') || '';

    useEffect(() => {
        async function fetchReports() {
            setIsLoading(true);
            try {
                const result = await fetchBooksAction('laporan_magang', {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    filter: filter,
                    sort: sort as 'relevance' | 'newest',
                });
                setReports(result.books);
                setTotalItems(result.totalItems);
            } catch (error) {
                console.error('Error fetching reports:', error);
                setReports([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchReports();
    }, [filter, sort, currentPage, year]);

    const totalPages = Math.min(Math.ceil(totalItems / ITEMS_PER_PAGE), 10);

    // Handlers removed

    return (
        <div className="min-h-screen pt-24">
            {/* Header */}
            <section className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-gray-900 py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="badge-warning mb-4">💼 Arsip Magang</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                            Laporan Magang
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            Koleksi laporan magang mahasiswa Politeknik Dewantara
                        </p>
                        <SearchBar showFilters />
                    </div>
                </div>
            </section>

            {/* Upload CTA */}
            <section className="py-8 bg-primary-50 dark:bg-primary-900/30">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary-900 dark:text-white">
                                    Sudah selesai magang?
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Upload laporan magang Anda untuk arsip perpustakaan
                                </p>
                            </div>
                        </div>
                        <Link href="/dashboard/unggah-laporan" className="btn-primary">
                            <Upload className="w-4 h-4" />
                            Upload Laporan
                        </Link>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 relative min-h-[500px]">
                <div className="container-custom">
                    {/* Results */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-500 dark:text-gray-400">
                            {isLoading ? (
                                'Memuat...'
                            ) : (
                                <>Menampilkan <span className="font-semibold text-primary-900 dark:text-white">{totalItems.toLocaleString()}</span> laporan magang</>
                            )}
                        </p>
                    </div>

                    {/* Reports List */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Memuat laporan...</p>
                        </div>
                    ) : reports.length > 0 ? (
                        <div className="grid gap-4">
                            {reports.map((report) => (
                                <Link
                                    key={report.id}
                                    href={`/koleksi/${report.id}`}
                                    className="card p-6 hover:shadow-hover transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                            <Briefcase className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-primary-900 dark:text-white group-hover:text-primary-500 transition-colors mb-2">
                                                {report.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Building className="w-4 h-4" />
                                                    {report.publisher || report.author}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {report.year}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-2">oleh {report.author}</p>
                                        </div>
                                        <div className="badge-warning">{report.year}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Tidak ada laporan ditemukan
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
                                                ? 'bg-orange-500 text-white'
                                                : page === '...'
                                                    ? 'bg-transparent text-gray-400 cursor-default'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default function LaporanMagangPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <LaporanMagangContent />
        </Suspense>
    );
}
