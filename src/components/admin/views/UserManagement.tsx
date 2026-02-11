'use client';

import { useState, useEffect } from 'react';
import {
    Users, GraduationCap, Plus, Search, Pencil, Trash2,
    Shield, KeyRound, Loader2, MoreVertical, FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import UserModal from '../modals/UserModal';

type Profile = {
    id: string;
    email: string;
    full_name: string;
    role: string;
    username: string;
    jurusan_id: string;
    program_studi?: string;
    nim?: string;
    avatar_url?: string;
    created_at: string;
};

export default function UserManagement() {
    const [activeTab, setActiveTab] = useState<'admin' | 'mahasiswa'>('mahasiswa');
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<Profile | undefined>(undefined);

    // Auth
    const supabase = createClient();

    // Fetch Data
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

            if (activeTab === 'admin') {
                query = query.in('role', ['admin', 'dosen']);
            } else {
                query = query.eq('role', 'mahasiswa');
            }

            if (searchQuery) {
                query = query.ilike('full_name', `%${searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [activeTab, searchQuery]); // Re-fetch on tab change or search

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Pengguna</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manajemen data dosen, admin, dan mahasiswa.</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('mahasiswa')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'mahasiswa'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                            }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        Mahasiswa
                    </button>
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'admin'
                            ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        Admin & Dosen
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 rounded-2xl border border-white/20 dark:border-gray-700">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Cari ${activeTab === 'admin' ? 'Dosen/Admin' : 'Mahasiswa'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <button
                    onClick={() => {
                        setModalMode('create');
                        setSelectedUser(undefined);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Tambah {activeTab === 'admin' ? 'Admin/Dosen' : 'Mahasiswa'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Info</th>
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
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada data pengguna ditemukan.
                                    </td>
                                    6</tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {user.full_name?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{user.full_name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                    user.role === 'dosen' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.role === 'mahasiswa' ? (
                                                <div className="flex flex-col">
                                                    <span>NIM: {user.nim || '-'}</span>
                                                    <span className="text-xs">{user.program_studi || '-'}</span>
                                                </div>
                                            ) : (
                                                <span>Username: {user.username}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setModalMode('edit');
                                                        setSelectedUser(user);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchUsers();
                    setIsModalOpen(false);
                }}
                mode={modalMode}
                userToEdit={selectedUser}
                initialRole={activeTab === 'mahasiswa' ? 'mahasiswa' : 'dosen'}
            />
        </div >
    );
}
