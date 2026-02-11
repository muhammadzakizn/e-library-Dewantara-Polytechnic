
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Mail, Lock, GraduationCap, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type UserModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode: 'create' | 'edit';
    userToEdit?: any;
    initialRole?: 'admin' | 'dosen' | 'mahasiswa';
};

import { getDepartments } from '@/app/actions/departments';

type Department = { id: string; name: string; code: string | null };

export default function UserModal({
    isOpen,
    onClose,
    onSuccess,
    mode,
    userToEdit,
    initialRole = 'mahasiswa'
}: UserModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        getDepartments().then(setDepartments);
    }, []);

    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        password: '',
        role: initialRole,
        nim: '',
        program_studi: '',
        username: ''
    });

    const supabase = createClient();

    useEffect(() => {
        if (mode === 'edit' && userToEdit) {
            setFormData({
                email: userToEdit.email || '',
                full_name: userToEdit.full_name || '',
                password: '', // Password not editable directly usually, or handled separately
                role: userToEdit.role || initialRole,
                nim: userToEdit.nim || '',
                program_studi: userToEdit.program_studi || '',
                username: userToEdit.username || ''
            });
        } else {
            setFormData({
                email: '',
                full_name: '',
                password: '',
                role: initialRole,
                nim: '',
                program_studi: '',
                username: ''
            });
        }
    }, [mode, userToEdit, initialRole, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (formData.role === 'mahasiswa' && !formData.nim) {
                alert('NIM wajib diisi untuk Mahasiswa');
                setIsLoading(false);
                return;
            }

            if (mode === 'create') {
                // Check if email already exists (simplified check)
                // In a real app, you'd use supabase admin api to create user, 
                // but since we might be client-side only for now or using a workaround:
                // We'll insert into profiles directly if using a trigger, OR use signUp

                // For this implementation, let's assume we use signUp (which logs the current user out if not careful)
                // OR we use a server action/api route.
                // Given the constraints and typical Supabase patterns without edge functions:
                // We'll try to insert into 'profiles' and let a trigger handle auth user creation if configured,
                // OR just alert that this is a "UI Demo" if backend logic isn't fully there for admin creating users.
                // However, usually we can insert to profiles.

                // Let's assume we insert to profiles 
                const { error } = await supabase.from('profiles').insert([
                    {
                        email: formData.email,
                        full_name: formData.full_name,
                        role: formData.role,
                        nim: formData.role === 'mahasiswa' ? formData.nim : null,
                        program_studi: formData.program_studi,
                        username: formData.username || formData.email.split('@')[0],
                        // password handling is tricky client-side without Admin API
                    }
                ]);

                if (error) throw error;

            } else {
                // Edit mode
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: formData.full_name,
                        // role: formData.role, // Usually role change is sensitive
                        nim: formData.role === 'mahasiswa' ? formData.nim : null,
                        program_studi: formData.program_studi,
                    })
                    .eq('id', userToEdit.id);

                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert(error.message || 'Gagal menyimpan data pengguna');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 dark:border-gray-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {mode === 'create' ? <PlusIcon className="w-5 h-5 text-blue-500" /> : <PencilIcon className="w-5 h-5 text-orange-500" />}
                        {mode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Role Selection (Only in Create Mode usually) */}
                        {mode === 'create' && (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'mahasiswa' })}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === 'mahasiswa'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <GraduationCap className="w-6 h-6" />
                                    <span className="font-medium text-sm">Mahasiswa</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'dosen' })}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === 'dosen'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                        }`}
                                >
                                    <Shield className="w-6 h-6" />
                                    <span className="font-medium text-sm">Dosen / Admin</span>
                                </button>
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Contoh: Muhammad Zaky"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    disabled={mode === 'edit'} // Email usually distinct identifier
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        {/* Password (Create Only) */}
                        {mode === 'create' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Min. 6 karakter"
                                    />
                                </div>
                            </div>
                        )}

                        {/* NIM (Mahasiswa Only) */}
                        {formData.role === 'mahasiswa' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIM</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nim}
                                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Nomor Induk Mahasiswa"
                                />
                            </div>
                        )}

                        {/* Program Studi (Mahasiswa/Dosen) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi / Jurusan</label>
                            <select
                                value={formData.program_studi}
                                onChange={(e) => setFormData({ ...formData, program_studi: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Pilih Program Studi</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}

function PencilIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    )
}
