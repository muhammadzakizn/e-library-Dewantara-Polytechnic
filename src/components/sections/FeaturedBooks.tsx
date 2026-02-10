'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import BookCard from '@/components/ui/BookCard';
import { searchGoogleBooks, Book } from '@/lib/api/books';

interface FeaturedBooksProps {
    query?: string;
    limit?: number;
}

export default function FeaturedBooks({ query = 'bisnis indonesia', limit = 6 }: FeaturedBooksProps) {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchBooks() {
            setIsLoading(true);
            try {
                const results = await searchGoogleBooks(query, { limit, language: 'id' });
                setBooks(results.books);
            } catch (error) {
                console.error('Failed to fetch books:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBooks();
    }, [query, limit]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                Tidak ada buku tersedia saat ini.
            </div>
        );
    }

    return (
        <div className="books-grid">
            {books.map((book) => (
                <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    coverUrl={book.coverUrl}
                    category={book.category}
                    year={book.year}
                    views={book.views}
                />
            ))}
        </div>
    );
}
