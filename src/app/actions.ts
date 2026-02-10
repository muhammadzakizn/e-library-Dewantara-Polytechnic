'use server';

import { trackActivity } from '@/lib/api/stats';
import { cookies } from 'next/headers';

export async function trackViewAction(pathname: string) {
    const cookieStore = cookies();
    // Simple session ID from cookie if available, or just rely on IP tracking in DB/middleware if we had it.
    // For now, we just pass the pathname. logic for user_id is handled in trackActivity if using auth.getUser() internally 
    // or we pass it here if we resolved it.
    // Since trackActivity uses createClient(), it can resolve the user from the current request context (cookies).
    
    await trackActivity(undefined, undefined, pathname);
    await trackActivity(undefined, undefined, pathname);
}

import { searchBooks } from '@/lib/api/books';

export async function fetchBooksAction(query: string) {
    return await searchBooks(query);
}
