'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Maximize2,
    Minimize2,
    Moon,
    Sun,
    Bookmark,
    BookmarkCheck,
    ArrowLeft,
    Loader2,
    ExternalLink,
    RotateCcw
} from 'lucide-react';
import { getBookById, Book } from '@/lib/api/books';

export default function ReaderPage() {
    const params = useParams();
    const bookId = params.id as string;

    const [book, setBook] = useState<Book | null>(null);
    const [isLoadingBook, setIsLoadingBook] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch book data
    useEffect(() => {
        async function fetchBook() {
            if (!bookId) return;
            setIsLoadingBook(true);
            try {
                const bookData = await getBookById(bookId);
                if (bookData) {
                    setBook(bookData);
                }
            } catch (error) {
                console.error('Failed to fetch book:', error);
            } finally {
                setIsLoadingBook(false);
            }
        }
        fetchBook();
    }, [bookId]);

    // Auto-hide controls
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    // Check if iframe loaded after timeout
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!iframeLoaded) {
                setIframeError(true);
            }
        }, 8000);

        return () => clearTimeout(timeout);
    }, [iframeLoaded]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Google Books embed URL
    const embedUrl = `https://books.google.co.id/books?id=${bookId}&lpg=PP1&pg=PP1&output=embed`;
    const googleBooksUrl = `https://books.google.co.id/books?id=${bookId}`;

    return (
        <div
            ref={containerRef}
            className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}
        >
            {/* Top Bar */}
            <div
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
                    }`}
            >
                <div className={`${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-lg shadow-lg`}>
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            {/* Left: Back button & Title */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <Link
                                    href={`/koleksi/${bookId}`}
                                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isDarkMode
                                            ? 'hover:bg-gray-700 text-gray-300'
                                            : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <h1 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {book?.title || 'Memuat...'}
                                    </h1>
                                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {book?.author || ''}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => setIsBookmarked(!isBookmarked)}
                                    className={`p-2 rounded-lg transition-colors ${isBookmarked
                                            ? 'text-secondary-500'
                                            : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        } ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                    title="Bookmark"
                                >
                                    {isBookmarked ? (
                                        <BookmarkCheck className="w-5 h-5" />
                                    ) : (
                                        <Bookmark className="w-5 h-5" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className={`p-2 rounded-lg transition-colors ${isDarkMode
                                            ? 'hover:bg-gray-700 text-gray-300'
                                            : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                    title="Toggle Dark Mode"
                                >
                                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={toggleFullscreen}
                                    className={`p-2 rounded-lg transition-colors ${isDarkMode
                                            ? 'hover:bg-gray-700 text-gray-300'
                                            : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                    title="Fullscreen"
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="w-5 h-5" />
                                    ) : (
                                        <Maximize2 className="w-5 h-5" />
                                    )}
                                </button>
                                <a
                                    href={googleBooksUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2 rounded-lg transition-colors ${isDarkMode
                                            ? 'hover:bg-gray-700 text-gray-300'
                                            : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                    title="Buka di Google Books"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Reader Area - Full Screen */}
            <div className="flex-1 pt-16 relative">
                {isLoadingBook ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                Memuat buku...
                            </p>
                        </div>
                    </div>
                ) : iframeError && !iframeLoaded ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center max-w-md px-4">
                            <div className="text-6xl mb-4">📚</div>
                            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Pratinjau Tidak Tersedia
                            </h2>
                            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Buku ini tidak tersedia untuk pratinjau di sini. Silakan buka langsung di Google Books.
                            </p>
                            <div className="flex flex-col gap-3">
                                <a
                                    href={googleBooksUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary inline-flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Buka di Google Books
                                </a>
                                <button
                                    onClick={() => {
                                        setIframeError(false);
                                        setIframeLoaded(false);
                                    }}
                                    className="btn-secondary inline-flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Loading overlay */}
                        {!iframeLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
                                <div className="text-center">
                                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                        Memuat konten buku...
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Google Books iframe */}
                        <iframe
                            src={embedUrl}
                            className="w-full h-[calc(100vh-4rem)] border-0"
                            onLoad={() => setIframeLoaded(true)}
                            allow="fullscreen"
                            title={book?.title || 'Book Reader'}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
