
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BookCard from '@/components/ui/BookCard';
import { Heart } from 'lucide-react';

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Heart className="w-6 h-6 text-red-500 fill-current" />
                        Favorit Saya
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Buku yang Anda tandai sebagai favorit
                    </p>
                </div>
            </div>

            {(!favorites || favorites.length === 0) ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        Belum ada favorit
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Anda belum menambahkan buku ke daftar favorit. Jelajahi koleksi dan klik ikon hati untuk menyimpan.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {favorites.map((fav: any) => {
                        const book = fav.book_data;
                        return (
                            <BookCard
                                key={fav.id} // or fav.book_id
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
    );
}
