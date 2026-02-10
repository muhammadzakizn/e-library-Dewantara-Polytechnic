'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Folder, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Book } from '@/lib/api/books';

interface Collection {
    id: string;
    name: string;
    book_count?: number;
    has_book?: boolean;
}

interface CollectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    book: Book;
}

export default function CollectionDialog({ isOpen, onClose, book }: CollectionDialogProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            checkUserAndFetchCollections();
        }
    }, [isOpen]);

    async function checkUserAndFetchCollections() {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
            await fetchCollections(user.id);
        }
        setIsLoading(false);
    }

    async function fetchCollections(userId: string) {
        // Fetch collections and check if book is in them
        const { data, error } = await supabase
            .from('collections')
            .select(`
                id, name,
                collection_items!inner (
                    book_id
                )
            `)
            .eq('user_id', userId);

        // This is a simplified fetch. In reality we might need a left join or separate query to check existence
        // For now, let's just get collections.

        try {
            const { data: collectionsData } = await supabase
                .from('collections')
                .select('id, name')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (collectionsData) {
                // Check which collections have this book
                const collectionsWithStatus = await Promise.all(collectionsData.map(async (col) => {
                    const { count } = await supabase
                        .from('collection_items')
                        .select('*', { count: 'exact', head: true })
                        .eq('collection_id', col.id)
                        .eq('book_id', book.id);

                    return {
                        ...col,
                        has_book: count ? count > 0 : false
                    };
                }));
                setCollections(collectionsWithStatus);
            }
        } catch (e) {
            console.error('Error fetching collections', e);
        }
    }

    async function createCollection() {
        if (!newCollectionName.trim() || !user) return;
        setIsCreating(true);

        try {
            const { data, error } = await supabase
                .from('collections')
                .insert({
                    name: newCollectionName,
                    user_id: user.id
                })
                .select()
                .single();

            if (data) {
                // Add book to the new collection immediately
                await addToCollection(data.id);
                setNewCollectionName('');
                await fetchCollections(user.id);
            }
        } catch (e) {
            console.error('Error creating collection', e);
        } finally {
            setIsCreating(false);
        }
    }

    async function toggleCollection(collectionId: string, hasBook: boolean) {
        if (!user) return;

        try {
            if (hasBook) {
                // Remove
                await supabase
                    .from('collection_items')
                    .delete()
                    .eq('collection_id', collectionId)
                    .eq('book_id', book.id);
            } else {
                // Add
                await supabase
                    .from('collection_items')
                    .insert({
                        collection_id: collectionId,
                        book_id: book.id,
                        book_data: book // Save book snapshot
                    });
            }

            // Update local state
            setCollections(prev => prev.map(c =>
                c.id === collectionId ? { ...c, has_book: !hasBook } : c
            ));
        } catch (e) {
            console.error('Error toggling collection', e);
        }
    }

    async function addToCollection(collectionId: string) {
        await supabase
            .from('collection_items')
            .insert({
                collection_id: collectionId,
                book_id: book.id,
                book_data: book
            });
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-xl transform transition-all scale-100 mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-primary-900 dark:text-white">
                        Simpan ke Koleksi
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!user ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Silakan masuk terlebih dahulu untuk menyimpan buku ini.
                        </p>
                        <a href="/login" className="btn-primary inline-flex">Masuk</a>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2">
                            {isLoading ? (
                                <div className="text-center py-4 text-gray-500">Memuat koleksi...</div>
                            ) : collections.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                    <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">Belum ada koleksi</p>
                                </div>
                            ) : (
                                collections.map((collection) => (
                                    <button
                                        key={collection.id}
                                        onClick={() => toggleCollection(collection.id, !!collection.has_book)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${collection.has_book
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                : 'border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Folder className={`w-5 h-5 ${collection.has_book ? 'fill-primary-500' : ''}`} />
                                            <span className="font-medium">{collection.name}</span>
                                        </div>
                                        {collection.has_book && <Check className="w-5 h-5" />}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Create New Collection */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <input
                                type="text"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                placeholder="Buat koleksi baru..."
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-500"
                                onKeyDown={(e) => e.key === 'Enter' && createCollection()}
                            />
                            <button
                                onClick={createCollection}
                                disabled={!newCollectionName.trim() || isCreating}
                                className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
