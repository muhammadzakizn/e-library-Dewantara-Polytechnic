'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    BookOpen,
    Download,
    Heart,
    Share2,
    Clock,
    User,
    Calendar,
    Building,
    FileText,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { getBookById, Book } from '@/lib/api/books';
import NotFoundPage from '@/app/not-found';

export default function BookDetailPage() {
    const params = useParams();
    // Handle array from [...id] catch-all
    const rawId = params.id;
    const bookId = Array.isArray(rawId) ? rawId.join('/') : rawId as string;

    const [book, setBook] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBook() {
            if (!bookId) return;

            setIsLoading(true);
            setError(null);

            try {
                const bookData = await getBookById(bookId);
                if (bookData) {
                    setBook(bookData);
                } else {
                    setError('Buku tidak ditemukan');
                }
            } catch (err) {
                setError('Gagal memuat data buku');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBook();
    }, [bookId]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Memuat detail buku...</p>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return <NotFoundPage />;
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* Breadcrumb */}
            <div className="bg-[var(--background-secondary)] py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="container-custom">
                    <Link
                        href="/koleksi"
                        className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Koleksi</span>
                    </Link>
                </div>
            </div>

            {/* Book Detail */}
            <div className="container-custom py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Book Cover */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28">
                            <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
                                {book.coverUrl ? (
                                    <Image
                                        src={book.coverUrl}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-900 p-8">
                                        <BookOpen className="w-20 h-20 text-primary-400 mb-4" />
                                        <span className="text-lg text-primary-600 dark:text-primary-400 text-center">
                                            {book.title}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 space-y-3">
                                <Link
                                    href={`/dashboard/reader/${bookId}`}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    Baca Sekarang
                                </Link>
                                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Unduh PDF
                                </button>
                                <div className="flex gap-3">
                                    <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                        <Heart className="w-5 h-5" />
                                        Simpan
                                    </button>
                                    <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                        <Share2 className="w-5 h-5" />
                                        Bagikan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Book Info */}
                    <div className="lg:col-span-2">
                        {/* Title & Author */}
                        <div className="mb-8">
                            <span className="badge-primary mb-4 inline-block">
                                {book.category === 'buku_digital' ? 'Buku Digital' :
                                    book.category === 'jurnal' ? 'Jurnal' :
                                        book.category === 'modul' ? 'Modul' : 'Laporan Magang'}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-4">
                                {book.title}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400">
                                oleh <span className="text-primary-500 font-medium">{book.author}</span>
                            </p>
                        </div>

                        {/* Meta Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-[var(--background-secondary)] rounded-xl p-4">
                                <Calendar className="w-5 h-5 text-primary-500 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Tahun Terbit</p>
                                <p className="font-semibold text-primary-900 dark:text-white">{book.year}</p>
                            </div>
                            <div className="bg-[var(--background-secondary)] rounded-xl p-4">
                                <FileText className="w-5 h-5 text-primary-500 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Halaman</p>
                                <p className="font-semibold text-primary-900 dark:text-white">
                                    {book.pageCount || 'N/A'}
                                </p>
                            </div>
                            <div className="bg-[var(--background-secondary)] rounded-xl p-4">
                                <Building className="w-5 h-5 text-primary-500 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Penerbit</p>
                                <p className="font-semibold text-primary-900 dark:text-white truncate">
                                    {book.publisher || 'N/A'}
                                </p>
                            </div>
                            <div className="bg-[var(--background-secondary)] rounded-xl p-4">
                                <Clock className="w-5 h-5 text-primary-500 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Bahasa</p>
                                <p className="font-semibold text-primary-900 dark:text-white uppercase">
                                    {book.language || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                                Deskripsi
                            </h2>
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                {book.description ? (
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {book.description}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 italic">
                                        Deskripsi tidak tersedia untuk buku ini.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ISBN */}
                        {book.isbn && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                                    Informasi Tambahan
                                </h2>
                                <div className="bg-[var(--background-secondary)] rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">ISBN</span>
                                        <span className="font-mono text-primary-900 dark:text-white">{book.isbn}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* External Link */}
                        {book.previewLink && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                                <a
                                    href={book.previewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Lihat di Google Books
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
