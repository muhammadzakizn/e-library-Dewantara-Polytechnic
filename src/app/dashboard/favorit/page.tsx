
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BookCard from '@/components/ui/BookCard';
import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function FavoritPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: favorites } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                            <Heart className="w-5 h-5 text-red-500 fill-current" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Favorit Saya
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {favorites && favorites.length > 0
                                    ? `${favorites.length} buku tersimpan`
                                    : 'Buku yang Anda tandai sebagai favorit'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {(!favorites || favorites.length === 0) ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-red-300 dark:text-red-700" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Belum ada favorit
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                            Anda belum menambahkan buku ke daftar favorit. Jelajahi koleksi dan klik ikon hati untuk menyimpan.
                        </p>
                        <Link
                            href="/koleksi/buku-digital"
                            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
                        >
                            Jelajahi Koleksi
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {favorites.map((fav: any) => {
                            const book = fav.book_data;
                            return (
                                <BookCard
                                    key={fav.id}
                                    id={book.id}
                                    title={book.title}
                                    author={book.author}
                                    coverUrl={book.coverUrl}
                                    category={book.category}
                                    year={book.year}
                                    views={book.views}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
