'use client';

import { useState, useEffect } from 'react';
import {
    BookOpen, FileText, Library, ClipboardCheck, Plus, Search,
    Pencil, Trash2, Eye, Download, CheckCircle, XCircle, Loader2,
    Filter
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import UploadCollectionModal from '@/components/admin/modals/UploadCollectionModal';

type LibraryTab = 'modul' | 'laporan' | 'buku' | 'jurnal';

export default function LibraryManagement() {
    const [activeTab, setActiveTab] = useState<LibraryTab>('modul');
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Auth
    const supabase = createClient();

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            let table = '';
            switch (activeTab) {
                case 'modul': table = 'modul_ajar'; break;
                case 'laporan': table = 'laporan_magang'; break;
                case 'buku': table = 'buku'; break;
                case 'jurnal': table = 'jurnal'; break;
            }

            let query = supabase.from(table).select('*').order('created_at', { ascending: false });

            if (searchQuery) {
                const searchCol = activeTab === 'laporan' ? 'title' : 'judul';
                query = query.ilike(searchCol, `%${searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab, searchQuery]);

    const handleDelete = async (id: string, fileUrl?: string, coverUrl?: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;

        try {
            let table = '';
            let bucket = '';

            switch (activeTab) {
                case 'modul': table = 'modul_ajar'; bucket = 'modul-ajar'; break;
                case 'laporan': table = 'laporan_magang'; break; // Laporan usually doesn't have file delete logic exposed here easily yet
                case 'buku': table = 'buku'; bucket = 'buku-digital'; break;
                case 'jurnal': table = 'jurnal'; bucket = 'jurnal'; break;
            }

            // Delete from DB
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;

            // Delete files if applicable (Simplified: assumes paths can be derived or we just delete DB record)
            // Ideally we delete from storage too.
            // For now, just DB delete to be safe. 
            // TODO: Implement storage cleanup.

            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Gagal menghapus item.');
        }
    };

    const getTabIcon = (tab: LibraryTab) => {
        switch (tab) {
            case 'modul': return BookOpen;
            case 'laporan': return ClipboardCheck;
            case 'buku': return Library;
            case 'jurnal': return FileText;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Pustaka</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manajemen konten digital perpustakaan.</p>
                </div>
            </div>

            {/* Tab Navigation (Glassmorphism Pills) */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                {(['modul', 'laporan', 'buku', 'jurnal'] as LibraryTab[]).map((tab) => {
                    const Icon = getTabIcon(tab);
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                                : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="capitalize">{tab.replace('_', ' ')} {tab === 'modul' ? 'Ajar' : tab === 'laporan' ? 'Magang' : tab === 'buku' ? 'Digital' : ''}</span>
                        </button>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 rounded-2xl border border-white/20 dark:border-gray-700">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Cari ${activeTab === 'laporan' ? 'judul laporan' : 'judul ' + activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Filter className="w-4 h-4" />
                        Detail
                    </button>
                    {activeTab !== 'laporan' && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20"
                        >
                            <Plus className="w-4 h-4" />
                            Upload
                        </button>
                    )}
                </div>
            </div>

            <UploadCollectionModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={fetchItems}
                type={activeTab as 'modul' | 'buku' | 'jurnal'}
            />

            {/* Content Table */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {activeTab === 'laporan' ? 'Penulis' : activeTab === 'modul' ? 'Dosen' : 'Penulis/Penerbit'}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori/Jurusan</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                            <p className="text-sm text-gray-500">Memuat data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada data {activeTab} ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                    {activeTab === 'laporan' ? <ClipboardCheck className="w-5 h-5 text-gray-500" /> :
                                                        activeTab === 'modul' ? <BookOpen className="w-5 h-5 text-gray-500" /> :
                                                            <FileText className="w-5 h-5 text-gray-500" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.title || item.judul}</div>
                                                    <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.user_name || item.dosen_name || item.penulis || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs">
                                                {item.jurusan_id || item.kategori || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                                                {item.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {activeTab === 'laporan' && item.status === 'pending' ? (
                                                    <>
                                                        <button title="Approve" className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button title="Reject" className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <a href={item.file_url || '#'} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
