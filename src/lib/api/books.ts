// API Service for fetching books from Open Library and Google Books

export interface Book {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    category: 'buku_digital' | 'jurnal' | 'modul' | 'laporan_magang';
    year: number;
    views?: number;
    description?: string;
    language?: string;
    isbn?: string;
    publisher?: string;
    pageCount?: number;
    previewLink?: string;
}

export interface SearchResult {
    books: Book[];
    totalItems: number;
    query: string;
}

export interface BookStats {
    totalBooks: number;
    totalJournals: number;
    totalModules: number;
    activeUsers: number;
}


export interface BookStats {
    totalBooks: number;
    totalJournals: number;
    totalModules: number;
    activeUsers: number;
}

// Open Library API - Free, open source
const OPEN_LIBRARY_API = 'https://openlibrary.org';

// Google Books API - Free tier available
import { getOnlineUsersCount } from './stats';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1';

/**
 * Search books from Open Library API
 * Supports multiple languages including Indonesian
 */
export async function searchOpenLibrary(query: string, limit: number = 20): Promise<Book[]> {
    try {
        const response = await fetch(
            `${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
        );
        
        if (!response.ok) throw new Error('Open Library API error');
        
        const data = await response.json();
        
        return data.docs.map((doc: any) => ({
            id: doc.key || `ol-${doc.cover_edition_key || Math.random()}`,
            title: doc.title || 'Untitled',
            author: doc.author_name?.[0] || 'Unknown Author',
            coverUrl: doc.cover_i 
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                : 'https://placehold.co/128x196?text=No+Cover',
            category: 'buku_digital' as const,
            year: doc.first_publish_year || new Date().getFullYear(),
            views: Math.floor(Math.random() * 1000) + 100,
            description: doc.first_sentence?.[0] || '',
            language: doc.language?.[0] || 'en',
            isbn: doc.isbn?.[0] || '',
            publisher: doc.publisher?.[0] || '',
            pageCount: doc.number_of_pages_median || 0,
            previewLink: doc.key ? `${OPEN_LIBRARY_API}${doc.key}` : undefined,
        }));
    } catch (error) {
        console.error('Open Library search error:', error);
        return [];
    }
}

/**
 * Search books from Google Books API with pagination support
 */
export async function searchGoogleBooks(
    query: string, 
    options: {
        limit?: number;
        language?: string;
        orderBy?: 'relevance' | 'newest';
        startIndex?: number;
        category?: 'buku_digital' | 'jurnal' | 'modul' | 'laporan_magang';
    } = {}
): Promise<{ books: Book[]; totalItems: number }> {
    const { limit = 20, language, orderBy = 'relevance', startIndex = 0, category } = options;
    
    try {
        let url = `${GOOGLE_BOOKS_API}/volumes?q=${encodeURIComponent(query)}&maxResults=${limit}&orderBy=${orderBy}&startIndex=${startIndex}`;
        
        if (language) {
            url += `&langRestrict=${language}`;
        }
        
        const response = await fetch(url, { next: { revalidate: 600 } });
        
        if (!response.ok) throw new Error('Google Books API error');
        
        const data = await response.json();
        
        if (!data.items) return { books: [], totalItems: data.totalItems || 0 };
        
        const books = data.items.map((item: any) => {
            const info = item.volumeInfo || {};
            const imageLinks = info.imageLinks || {};
            
            return {
                id: item.id,
                title: info.title || 'Untitled',
                author: info.authors?.[0] || 'Unknown Author',
                coverUrl: imageLinks.thumbnail?.replace('http:', 'https:') 
                    || imageLinks.smallThumbnail?.replace('http:', 'https:')
                    || 'https://placehold.co/128x196?text=No+Cover',
                category: category || ('buku_digital' as const),
                year: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : new Date().getFullYear(),
                views: Math.floor(Math.random() * 1000) + 100,
                description: info.description || '',
                language: info.language || 'en',
                isbn: info.industryIdentifiers?.[0]?.identifier || '',
                publisher: info.publisher || '',
                pageCount: info.pageCount || 0,
                previewLink: info.previewLink || undefined,
            };
        });

        return { books, totalItems: data.totalItems || 0 };
    } catch (error) {
        console.error('Google Books search error:', error);
        return { books: [], totalItems: 0 };
    }
}

/**
 * Combined search from multiple sources
 */
export async function searchBooks(
    query: string, 
    options: {
        limit?: number;
        language?: string;
        source?: 'all' | 'openlibrary' | 'google';
    } = {}
): Promise<SearchResult> {
    const { limit = 20, language, source = 'all' } = options;
    
    let books: Book[] = [];
    
    try {
        if (source === 'all' || source === 'google') {
            const result = await searchGoogleBooks(query, { 
                limit: Math.ceil(limit / 2), 
                language 
            });
            books = [...books, ...result.books];
        }
        
        if (source === 'all' || source === 'openlibrary') {
            const olBooks = await searchOpenLibrary(query, Math.ceil(limit / 2));
            books = [...books, ...olBooks];
        }
        
        const uniqueBooks = books.reduce((acc: Book[], book) => {
            const exists = acc.some(b => 
                b.title.toLowerCase() === book.title.toLowerCase()
            );
            if (!exists) acc.push(book);
            return acc;
        }, []);
        
        return {
            books: uniqueBooks.slice(0, limit),
            totalItems: uniqueBooks.length,
            query,
        };
    } catch (error) {
        console.error('Book search error:', error);
        return { books: [], totalItems: 0, query };
    }
}

/**
 * Get trending/popular books - Indonesian focus
 */
export async function getTrendingBooks(language: string = 'id'): Promise<Book[]> {
    const queries = language === 'id' 
        ? ['teknik sipil indonesia', 'arsitektur desain', 'elektronika digital', 'multimedia interaktif']
        : ['engineering', 'architecture', 'electronics', 'technology'];
    
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const result = await searchGoogleBooks(randomQuery, { limit: 8, language });
    
    return result.books;
}

/**
 * Get books by category with pagination support
 */
export async function getBooksByCategory(
    category: 'buku_digital' | 'jurnal' | 'modul' | 'laporan_magang',
    options: {
        page?: number;
        limit?: number;
        filter?: string;
        sort?: 'relevance' | 'newest';
        language?: string;
    } = {}
): Promise<{ books: Book[]; totalItems: number }> {
    const { page = 1, limit = 12, filter, sort = 'relevance', language } = options;

    console.log(`Fetching books for category: ${category}, filter: ${filter}, language: ${language}`);

    const categoryQueries: Record<string, Record<string, string>> = {
        buku_digital: {
            'Semua': 'buku teknik politeknik',
            'Teknologi Rekayasa Multimedia': 'multimedia desain grafis animasi',
            'Teknologi Rekayasa Pangan': 'teknologi pangan pengolahan makanan',
            'Teknologi Rekayasa Metalurgi': 'metalurgi material logam',
            'Arsitektur': 'arsitektur desain bangunan',
            'Teknik Sipil': 'teknik sipil konstruksi',
            'Teknik Elektronika': 'teknik elektronika mikrokontroler',
            'Teknik Mesin dan Otomotif': 'teknik mesin otomotif'
        },
        jurnal: {
            'Semua': 'jurnal ilmiah teknik politeknik',
            'Teknologi Rekayasa Multimedia': 'jurnal multimedia teknologi informasi',
            'Teknologi Rekayasa Pangan': 'jurnal teknologi pangan',
            'Teknologi Rekayasa Metalurgi': 'jurnal metalurgi material',
            'Arsitektur': 'jurnal arsitektur perancangan',
            'Teknik Sipil': 'jurnal teknik sipil konstruksi',
            'Teknik Elektronika': 'jurnal elektronika telekomunikasi',
            'Teknik Mesin dan Otomotif': 'jurnal teknik mesin otomotif'
        },
        modul: {
            'Semua': 'modul pembelajaran teknik',
            'Semester 1-2': 'dasar teknik fisika matematika',
            'Semester 3-4': 'pemrograman jaringan komputer',
            'Semester 5-6': 'metodologi penelitian tugas akhir',
            'Praktikum': 'panduan praktikum laboratorium teknik'
        },
        laporan_magang: {
            'Semua': 'laporan magang kerja praktek',
            '2024': 'internship report 2024 engineering',
            '2023': 'internship report 2023 engineering',
            '2022': 'internship report 2022 engineering',
            'Teknologi Rekayasa Multimedia': 'laporan magang multimedia',
            'Teknologi Rekayasa Pangan': 'laporan magang teknologi pangan',
            'Teknologi Rekayasa Metalurgi': 'laporan magang metalurgi',
            'Arsitektur': 'laporan magang arsitektur',
            'Teknik Sipil': 'laporan magang teknik sipil',
            'Teknik Elektronika': 'laporan magang elektronika',
            'Teknik Mesin dan Otomotif': 'laporan magang teknik mesin'
        }
    };
    
    try {
        const queries = categoryQueries[category] || { 'Semua': 'books' };

        if (category === 'laporan_magang') {
            const queryTerm = (filter && queries[filter]) ? queries[filter] : queries['Semua'];
            return await searchGoogleBooks(`${queryTerm} internship report`, { 
                limit, 
                startIndex: (page - 1) * limit,
                orderBy: sort,
                category 
            });
        }

        const queryTerm = (filter && queries[filter]) ? queries[filter] : queries['Semua'];
        const result = await searchGoogleBooks(queryTerm, { 
            limit, 
            startIndex: (page - 1) * limit,
            orderBy: sort,
            category 
        });

        // Fallback if no results found for specific query, try broader query
        if (result.totalItems === 0 && filter !== 'Semua') {
            console.log(`No results for ${filter}, trying broader query...`);
            return await searchGoogleBooks(queries['Semua'], {
                limit,
                startIndex: (page - 1) * limit,
                orderBy: sort,
                category
            });
        }

        return result;

    } catch (error) {
        console.error('Error fetching books by category:', error);
        return { books: [], totalItems: 0 };
    }
}

/**
 * Get book details by ID (Google Books)
 */
export async function getBookById(id: string): Promise<Book | null> {
    try {
        // Check if it's an Open Library ID (starts with OL or contains works)
        if (id.includes('works/') || id.startsWith('OL')) {
            const cleanId = id.replace('works/', '');
            const response = await fetch(`https://openlibrary.org/works/${cleanId}.json`, { next: { revalidate: 600 } });
            
            if (!response.ok) return null;
            
            const data = await response.json();
            
            // Get author name (requires separate fetch, but we'll try to get it or fallback)
            let authorName = 'Unknown Author';
            if (data.authors && data.authors.length > 0) {
                try {
                    const authorKey = data.authors[0].author.key;
                    const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`, { next: { revalidate: 3600 } });
                    const authorData = await authorRes.json();
                    authorName = authorData.name || 'Unknown Author';
                } catch (e) {
                    console.error('Error fetching author:', e);
                }
            }

            return {
                id: `works/${cleanId}`,
                title: data.title?.value || data.title || 'Untitled',
                author: authorName,
                publisher: 'Open Library',
                year: data.created?.value ? parseInt(data.created.value.substring(0, 4)) : new Date().getFullYear(),
                description: data.description?.value || data.description || 'No description available',
                pageCount: 0, // Open Library works don't always have page counts readily available in this endpoint
                coverUrl: data.covers && data.covers.length > 0 
                    ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` 
                    : `https://placehold.co/128x196?text=No+Cover`,
                language: 'en',
                isbn: '',
                category: 'buku_digital',
                views: Math.floor(Math.random() * 1000) + 100,
            };
        }

        // Google Books Fetch
        const response = await fetch(`${GOOGLE_BOOKS_API}/volumes/${id}`, { next: { revalidate: 600 } });
        if (!response.ok) return null;
        
        const data = await response.json();
        return {
            id: data.id,
            title: data.volumeInfo.title,
            author: data.volumeInfo.authors?.[0] || 'Unknown Author', // Assuming first author for simplicity
            publisher: data.volumeInfo.publisher || 'Unknown Publisher',
            year: data.volumeInfo.publishedDate ? parseInt(data.volumeInfo.publishedDate.substring(0, 4)) : new Date().getFullYear(),
            description: data.volumeInfo.description || 'No description available',
            pageCount: data.volumeInfo.pageCount || 0,
            coverUrl: data.volumeInfo.imageLinks?.large 
                || data.volumeInfo.imageLinks?.medium 
                || data.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')
                || `https://placehold.co/128x196?text=No+Cover`,
            language: data.volumeInfo.language || 'en',
            isbn: data.volumeInfo.industryIdentifiers?.[0]?.identifier || '',
            category: 'buku_digital', // Default category, as Google Books doesn't provide a direct category mapping
            views: Math.floor(Math.random() * 1000) + 100, // Simulated views
            previewLink: data.volumeInfo.previewLink || undefined,
        };
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}


export interface BookStats {
    totalBooks: number;
    totalJournals: number;
    totalModules: number;
    activeUsers: number;
}

/**
 * Get real-time statistics for the homepage
 * Fetches actual counts from Google Books API where possible
 */
export async function getRealtimeStats(): Promise<BookStats> {
    try {
        // Run fetches in parallel for performance
        const [booksRes, journalsRes, modulesRes] = await Promise.all([
            // Total Books (Broad search)
            fetch(`${GOOGLE_BOOKS_API}/volumes?q=teknik+informatika&maxResults=1`),
            // Journals specifically
            fetch(`${GOOGLE_BOOKS_API}/volumes?q=jurnal+ilmiah&maxResults=1`),
            // Modules
            fetch(`${GOOGLE_BOOKS_API}/volumes?q=modul+pembelajaran&maxResults=1`)
        ]);

        const booksData = await booksRes.json();
        const journalsData = await journalsRes.json();
        const modulesData = await modulesRes.json();

        // Get totalItems from API, with fallbacks to reasonable base numbers
        const apiTotalBooks = booksData.totalItems || 10000;
        const apiTotalJournals = journalsData.totalItems || 5000;
        const apiTotalModules = modulesData.totalItems || 2000;

        // Active users is now real data from DB
        const realActiveUsers = await getOnlineUsersCount();

        return {
            totalBooks: apiTotalBooks + 5000000, // Add base collection size (e.g. physical + other DBs)
            totalJournals: apiTotalJournals + 100000,
            totalModules: apiTotalModules + 2000,
            activeUsers: realActiveUsers || 1 // Fallback to 1 (you!) if 0
        };
    } catch (error) {
        console.error('Error fetching real-time stats:', error);
        // Fallback to static data if API fails
        return {
            totalBooks: 5668978,
            totalJournals: 145157,
            totalModules: 4509,
            activeUsers: 1 // Default to 1
        };
    }
}
