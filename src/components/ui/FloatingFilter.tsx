'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Check, SlidersHorizontal } from 'lucide-react';

interface FilterOption {
    label: string;
    value: string;
}

interface FloatingFilterProps {
    categories?: FilterOption[];
    years?: FilterOption[];
    sortOptions?: FilterOption[];
}

export default function FloatingFilter({
    categories = [],
    years = [],
    sortOptions = [
        { label: 'Terbaru', value: 'newest' },
        { label: 'Terpopuler', value: 'relevance' } // or popular
    ]
}: FloatingFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for filter selections
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('filter') || 'Semua');
    const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
    const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');

    // Update local state when URL changes
    useEffect(() => {
        setSelectedCategory(searchParams.get('filter') || 'Semua');
        setSelectedYear(searchParams.get('year') || '');
        setSelectedSort(searchParams.get('sort') || 'newest');
    }, [searchParams]);

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedCategory && selectedCategory !== 'Semua') {
            params.set('filter', selectedCategory);
        } else {
            params.delete('filter');
        }

        if (selectedYear) {
            params.set('year', selectedYear);
        } else {
            params.delete('year');
        }

        if (selectedSort) {
            params.set('sort', selectedSort);
        } else {
            params.delete('sort');
        }

        router.push(`?${params.toString()}`);
        setIsOpen(false);
    };

    const handleReset = () => {
        setSelectedCategory('Semua');
        setSelectedYear('');
        setSelectedSort('newest');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('filter');
        params.delete('year');
        params.set('sort', 'newest');
        router.push(`?${params.toString()}`);
        setIsOpen(false);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-40 p-4 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/30 hover:scale-110 active:scale-95 transition-all duration-300 group"
            >
                <SlidersHorizontal className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </button>

            {/* Filter Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl scale-100 animate-scale-in overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Filter className="w-5 h-5 text-blue-600" /> Filter & Urutkan
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Sort Options */}
                            <div>
                                <label className="text-sm font-semibold text-gray-500 mb-3 block uppercase tracking-wider">Urutkan</label>
                                <div className="flex flex-wrap gap-2">
                                    {sortOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSelectedSort(opt.value)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedSort === opt.value
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full h-px bg-gray-100 dark:bg-gray-700" />

                            {/* Categories (Tags) */}
                            {categories.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 mb-3 block uppercase tracking-wider">Kategori</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedCategory('Semua')}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${selectedCategory === 'Semua' || !selectedCategory
                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            Semua
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.value}
                                                onClick={() => setSelectedCategory(cat.value)}
                                                className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${selectedCategory === cat.value
                                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                                                    }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Years (if provided) */}
                            {years.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 mb-3 block uppercase tracking-wider">Tahun</label>
                                    <div className="flex flex-wrap gap-2">
                                        {years.map((y) => (
                                            <button
                                                key={y.value}
                                                onClick={() => setSelectedYear(selectedYear === y.value ? '' : y.value)}
                                                className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${selectedYear === y.value
                                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                                                    }`}
                                            >
                                                {y.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 flex gap-3">
                            <button
                                onClick={handleReset}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
