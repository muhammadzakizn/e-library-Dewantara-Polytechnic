import { createClient } from '@/lib/supabase/client';
import { Book } from './books'; 

export async function getCollectionItems(
    category: 'laporan_magang' | 'modul' | 'buku_digital' | 'jurnal',
    options: {
        page?: number;
        limit?: number;
        filter?: string;
        sort?: 'relevance' | 'newest';
        search?: string;
    } = {}
) {
    const supabase = createClient();
    const page = options.page || 1;
    const limit = options.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let table = '';
    let statusField = 'status';
    let statusValue = 'published';

    switch (category) {
        case 'laporan_magang':
            table = 'laporan_magang';
            statusValue = 'approved';
            break;
        case 'modul':
            table = 'modul_ajar';
            break;
        case 'buku_digital':
            table = 'buku';
            break;
        case 'jurnal':
            table = 'jurnal';
            break;
    }

    let query = supabase
        .from(table)
        .select('*', { count: 'exact' })
        .eq(statusField, statusValue)
        .range(start, end);

    // Apply Search
    if (options.search) {
        const searchCol = category === 'laporan_magang' ? 'title' : 'judul';
        query = query.ilike(searchCol, `%${options.search}%`);
    }

    // Apply Sort
    // Note: 'relevance' is difficult without full text search, defaulting to 'created_at' desc for now
    if (options.sort === 'newest' || options.sort === 'relevance') {
        query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
        console.error(`Error fetching ${category}:`, error);
        return { books: [], totalItems: 0 };
    }

    // Map to 'Book' interface for compatibility with UI components
    const mappedItems: Book[] = data.map((item: any) => ({
        id: item.id,
        title: item.title || item.judul,
        author: item.penulis || item.author || item.dosen_name || 'Unknown',
        publisher: item.penerbit || item.company || 'Politeknik Dewantara',
        year: parseInt(item.tahun_terbit || item.year || new Date(item.created_at).getFullYear().toString()),
        coverUrl: item.cover_url || '/images/placeholder-book.png',
        category: category,
        description: item.deskripsi || item.description || '',
        pageCount: 0, 
        language: 'id',
        previewLink: item.file_url ? item.file_url : '#', 
        isbn: item.isbn || item.issn || '',
        views: item.download_count || 0
    }));

    return {
        books: mappedItems,
        totalItems: count || 0
    };
}
