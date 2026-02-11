'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FileText, Trash2, Download, Eye, Calendar, Building,
    Plus, Loader2, AlertCircle, Clock, CheckCircle, XCircle,
    ChevronRight, ArrowLeft, Search
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface LaporanMagang {
    id: string;
    title: string;
    company: string;
    start_date: string;
    end_date: string;
    description: string;
    file_path: string;
    status: string;
    created_at: string;
    user_name: string;
    user_nim: string;
    user_prodi: string;
}

export default function LaporanSayaPage() {
    const router = useRouter();
    const [laporanList, setLaporanList] = useState<LaporanMagang[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLaporan();
    }, []);

    const fetchLaporan = async () => {
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('laporan_magang')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                setError('Gagal memuat data laporan. Pastikan tabel "laporan_magang" sudah dibuat di Supabase.');
                console.error(error);
            } else {
                setLaporanList(data || []);
            }
        } catch (err) {
            console.error('Error fetching laporan:', err);
            setError('Gagal memuat data. Silakan muat ulang halaman.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, filePath: string) => {
        setIsDeleting(true);
        const supabase = createClient();

        // Delete file from storage
        await supabase.storage.from('laporan-magang').remove([filePath]);

        // Delete record from database
        const { error } = await supabase
            .from('laporan_magang')
            .delete()
            .eq('id', id);

        if (error) {
            setError('Gagal menghapus laporan.');
        } else {
            setLaporanList(prev => prev.filter(l => l.id !== id));
        }

        setDeleteId(null);
        setIsDeleting(false);
    };

    const handleDownload = async (filePath: string, title: string) => {
        const supabase = createClient();
        const { data } = supabase.storage.from('laporan-magang').getPublicUrl(filePath);
        if (data?.publicUrl) {
            window.open(data.publicUrl, '_blank');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" /> Disetujui
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3 h-3" /> Ditolak
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Clock className="w-3 h-3" /> Menunggu Review
                    </span>
                );
        }
    };

    const filteredLaporan = laporanList.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="section-padding container-custom min-h-screen pt-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="section-padding container-custom min-h-screen pt-24 pb-12 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan Magang Saya</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kelola semua laporan magang yang telah Anda unggah</p>
                    </div>
                </div>
                <Link
                    href="/dashboard/unggah-laporan"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Upload Baru
                </Link>
            </div>

            {/* Search */}
            {laporanList.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan judul atau perusahaan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    />
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {filteredLaporan.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {searchQuery ? 'Tidak Ditemukan' : 'Belum Ada Laporan'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
                        {searchQuery
                            ? `Tidak ada laporan yang cocok dengan "${searchQuery}"`
                            : 'Anda belum mengunggah laporan magang. Mulai upload laporan pertama Anda.'
                        }
                    </p>
                    {!searchQuery && (
                        <Link
                            href="/dashboard/unggah-laporan"
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Upload Laporan
                        </Link>
                    )}
                </div>
            )}

            {/* Laporan List */}
            <div className="space-y-4">
                {filteredLaporan.map((laporan) => (
                    <div
                        key={laporan.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between gap-4">
                            {/* Left: Info */}
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                                        {laporan.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="inline-flex items-center gap-1">
                                            <Building className="w-3.5 h-3.5" />
                                            {laporan.company}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(laporan.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {' - '}
                                            {new Date(laporan.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {laporan.description && (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {laporan.description}
                                        </p>
                                    )}
                                    <div className="mt-3">
                                        {getStatusBadge(laporan.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleDownload(laporan.file_path, laporan.title)}
                                    className="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                                    title="Download / Lihat PDF"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setDeleteId(laporan.id)}
                                    className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                    title="Hapus Laporan"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                            Hapus Laporan?
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                            Laporan yang sudah dihapus tidak dapat dikembalikan. File PDF juga akan dihapus dari server.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    const laporan = laporanList.find(l => l.id === deleteId);
                                    if (laporan) handleDelete(deleteId, laporan.file_path);
                                }}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</>
                                ) : (
                                    'Ya, Hapus'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
