'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Bookmark } from 'lucide-react';
import CollectionDialog from '@/components/collections/CollectionDialog';
import { Book } from '@/lib/api/books';
import { createClient } from '@/lib/supabase/client';

interface BookCardProps {
    id: string;
    title: string;
    author: string;
    coverUrl?: string;
    category: 'buku_digital' | 'jurnal' | 'modul' | 'laporan_magang';
    year?: number;
    views?: number;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
    buku_digital: { label: 'Buku Digital', color: 'badge-primary' },
    jurnal: { label: 'Jurnal', color: 'badge-secondary' },
    modul: { label: 'Modul', color: 'badge-success' },
    laporan_magang: { label: 'Laporan Magang', color: 'badge-warning' },
};

export default function BookCard({
    id,
    title,
    author,
    coverUrl,
    category,
    year,
    views = 0,
}: BookCardProps) {
    const categoryInfo = categoryLabels[category] || categoryLabels.buku_digital;
    const [isFavorite, setIsFavorite] = useState(false);
    const [isFavLoading, setIsFavLoading] = useState(false);
    const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);

    // Check if this book is already favorited on mount
    useEffect(() => {
        const checkFavorite = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('book_id', id)
                .maybeSingle();

            if (data) setIsFavorite(true);
        };
        checkFavorite();
    }, [id]);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFavLoading) return;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Not logged in, redirect to login
            window.location.href = '/login';
            return;
        }

        setIsFavLoading(true);

        try {
            if (isFavorite) {
                // Remove from favorites
                await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('book_id', id);
                setIsFavorite(false);
            } else {
                // Add to favorites
                const bookData = {
                    id, title, author,
                    coverUrl: coverUrl || '',
                    category,
                    year: year || new Date().getFullYear(),
                    views,
                };
                await supabase
                    .from('favorites')
                    .upsert({
                        user_id: user.id,
                        book_id: id,
                        book_data: bookData,
                    }, { onConflict: 'user_id,book_id' });
                setIsFavorite(true);
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
        } finally {
            setIsFavLoading(false);
        }
    };

    const handleCollection = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCollectionDialogOpen(true);
    };

    // Construct book object for dialog
    const bookObj: Book = {
        id, title, author,
        coverUrl: coverUrl || '',
        category, year: year || new Date().getFullYear(),
        views
    };

    return (
        <>
            <Link href={`/koleksi/${id}`} className="book-card block group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                {/* Book Cover */}
                <div className="book-cover">
                    {coverUrl ? (
                        <Image
                            src={coverUrl}
                            alt={title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-900 p-4">
                            <span className="text-4xl mb-2">📚</span>
                            <span className="text-xs text-primary-600 dark:text-primary-400 text-center line-clamp-2">
                                {title}
                            </span>
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="book-overlay">
                        <button className="btn btn-primary text-sm px-4 py-2">
                            Baca Sekarang
                        </button>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                        <span className={categoryInfo.color}>{categoryInfo.label}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${isFavorite
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 dark:bg-gray-800/90 text-gray-500 hover:text-red-500 hover:bg-red-50'
                                }`}
                            onClick={handleFavorite}
                            disabled={isFavLoading}
                            title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                        >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''} ${isFavLoading ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                            className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                            onClick={handleCollection}
                            title="Simpan ke Koleksi"
                        >
                            <Bookmark className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Book Info */}
                <div className="book-info">
                    <h3 className="book-title">{title}</h3>
                    <p className="book-author">{author}</p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                        {year && <span>{year}</span>}
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {views.toLocaleString()}
                        </span>
                    </div>
                </div>
            </Link>

            {isCollectionDialogOpen && (
                <CollectionDialog
                    isOpen={isCollectionDialogOpen}
                    onClose={() => setIsCollectionDialogOpen(false)}
                    book={bookObj}
                />
            )
            }
        </>
    );
}
