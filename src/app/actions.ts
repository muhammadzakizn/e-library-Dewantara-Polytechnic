'use server';

import { trackActivity } from '@/lib/api/stats';
import { cookies } from 'next/headers';

export async function trackViewAction(pathname: string) {
    const cookieStore = cookies();
    await trackActivity(undefined, undefined, pathname);
    await trackActivity(undefined, undefined, pathname);
}

import { searchBooks, getBooksByCategory } from '@/lib/api/books';

export async function fetchBooksAction(
    category: 'buku_digital' | 'jurnal' | 'modul' | 'laporan_magang',
    options: {
        page?: number;
        limit?: number;
        filter?: string;
        sort?: 'relevance' | 'newest';
    } = {}
) {
    return await getBooksByCategory(category, options);
}

export async function searchBooksAction(query: string) {
    return await searchBooks(query);
}
