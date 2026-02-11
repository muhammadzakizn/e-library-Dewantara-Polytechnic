import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Folder, Trash2, ExternalLink, BookOpen } from 'lucide-react';
import Image from 'next/image';

export default async function CollectionDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch collection details
    const { data: collection } = await supabase
        .from('collections')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (!collection) {
        redirect('/dashboard/koleksi');
    }

    // Fetch items in this collection
    const { data: items } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', params.id)
        .order('added_at', { ascending: false });

    return (
        <div className="section-padding container-custom min-h-screen pt-24 pb-12 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/koleksi"
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{collection.name}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {items?.length || 0} item dalam koleksi
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            {items && items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => {
                        const book = item.book_data as any;
                        return (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                            >
                                {/* Cover */}
                                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                                    {book?.cover ? (
                                        <img
                                            src={book.cover}
                                            alt={book?.title || 'Book cover'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm mb-1">
                                        {book?.title || 'Untitled'}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                        {book?.author || 'Unknown Author'}
                                    </p>

                                    {book?.id && (
                                        <Link
                                            href={`/koleksi/${book.id}`}
                                            className="mt-3 flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-600 font-medium"
                                        >
                                            Lihat Detail <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Koleksi Masih Kosong
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        Tambahkan buku ke koleksi ini dengan cara menekan tombol &quot;Tambah ke Koleksi&quot; pada halaman detail buku.
                    </p>
                    <Link href="/koleksi" className="btn-primary mt-6 inline-flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Jelajahi Buku
                    </Link>
                </div>
            )}
        </div>
    );
}
