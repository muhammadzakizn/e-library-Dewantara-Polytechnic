'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    onSearch?: (query: string) => void;
    showFilters?: boolean;
}

const searchPhrases = [
    'buku...',
    'jurnal...',
    'modul...',
    'laporan magang...',
    'materi kuliah...',
];

const ACADEMIC_TERMS = [
    'Manajemen Keuangan', 'Akuntansi Dasar', 'Sistem Informasi', 'Pemasaran Digital',
    'Ekonomi Makro', 'Hukum Bisnis', 'Psikologi Industri', 'Algoritma Pemrograman',
    'Metode Penelitian', 'Statistika Bisnis', 'Perpajakan', 'Audit Keuangan',
    'Manajemen SDM', 'Komunikasi Bisnis', 'Etika Profesi', 'Machine Learning'
];

export default function SearchBar({
    onSearch,
    showFilters = false,
}: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [popularTerms, setPopularTerms] = useState<string[]>([]);

    useEffect(() => {
        // Shuffle and pick 5 terms on mount
        const shuffled = [...ACADEMIC_TERMS].sort(() => 0.5 - Math.random());
        setPopularTerms(shuffled.slice(0, 5));
    }, []);

    // Typing animation effect
    useEffect(() => {
        const currentPhrase = searchPhrases[currentPhraseIndex];
        let timeout: NodeJS.Timeout;

        if (isTyping) {
            if (displayText.length < currentPhrase.length) {
                timeout = setTimeout(() => {
                    setDisplayText(currentPhrase.slice(0, displayText.length + 1));
                }, 100);
            } else {
                // Wait before starting to delete
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 2000);
            }
        } else {
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, 50);
            } else {
                // Move to next phrase
                setCurrentPhraseIndex((prev) => (prev + 1) % searchPhrases.length);
                setIsTyping(true);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayText, isTyping, currentPhraseIndex]);

    const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim()) {
            router.push(`/koleksi?q=${encodeURIComponent(searchQuery.trim())}`);
            if (onSearch) {
                onSearch(searchQuery);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handlePopularClick = (term: string) => {
        setQuery(term);
        handleSearch(term);
    };

    const handleClear = () => {
        setQuery('');
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full mx-auto">
            <div
                className={`relative flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 ${isFocused
                    ? 'border-primary-500 shadow-primary-500/20'
                    : 'border-gray-100 dark:border-gray-700'
                    }`}
            >
                {/* Search Icon */}
                <div className="absolute left-5 text-gray-400 pointer-events-none">
                    <Search className="w-6 h-6" />
                </div>

                {/* Input */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow clear button click
                    placeholder={`Cari ${displayText}`}
                    className="w-full py-5 pl-14 pr-32 text-base bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />

                {/* Clear Button */}
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-24 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Search Button */}
                <button
                    type="submit"
                    className="absolute right-3 btn-primary py-3 px-6 text-base font-semibold rounded-xl"
                >
                    Cari
                </button>
            </div>

            {/* Quick Suggestions (shown on focus) */}
            {isFocused && !query && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-5 mb-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                            Pencarian Populer
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                            LIVE
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 px-5">
                        {popularTerms.map(
                            (suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent blur
                                        handlePopularClick(suggestion);
                                    }}
                                    className="px-4 py-2 rounded-full text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors font-medium border border-transparent hover:border-primary-200"
                                >
                                    {suggestion}
                                </button>
                            )
                        )}
                    </div>
                </div>
            )}
        </form>
    );
}
