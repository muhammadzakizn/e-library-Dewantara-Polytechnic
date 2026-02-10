
import { createClient } from '@/lib/supabase/server';
import { Folder, Plus, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function KoleksiPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch collections with item count
    const { data: collections } = await supabase
        .from('collections')
        .select(`
            *,
            collection_items (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="section-padding container-custom min-h-screen pt-24 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="heading-2 text-gray-900 dark:text-white">Koleksi Saya</h1>
                    <p className="body-text text-gray-500 dark:text-gray-400 mt-1">
                        Atur buku dan jurnal favorit Anda dalam koleksi
                    </p>
                </div>
                {/* <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Buat Koleksi
                </button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Card (Visual only for now, logic is in Dialog) */}
                <button className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group min-h-[200px]">
                    <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">Buat Koleksi Baru</span>
                    <span className="text-sm text-gray-500 mt-1">Simpan buku ke topik khusus</span>
                </button>

                {collections?.map((collection) => (
                    <Link
                        key={collection.id}
                        href={`/dashboard/koleksi/${collection.id}`}
                        className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 flex flex-col justify-between min-h-[200px]"
                    >
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {collection.collection_items?.[0]?.count || 0} Item
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                                {collection.name}
                            </h3>
                            {/* <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {collection.description || 'Tidak ada deskripsi'}
                            </p> */}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-primary-500 font-medium pt-4 border-t border-gray-50 dark:border-gray-700/50">
                            Lihat Koleksi <BookOpen className="w-4 h-4" />
                        </div>
                    </Link>
                ))}

                {(!collections || collections.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 font-medium">Belum ada koleksi yang dibuat.</p>
                        <p className="text-sm text-gray-400">Mulailah dengan membuat koleksi baru.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
