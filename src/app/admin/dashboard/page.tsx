'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LogOut, Users, BookOpen, FileText, Activity, Settings, GraduationCap,
    Shield, Plus, Pencil, Trash2, Check, X, Loader2, ChevronRight,
    LayoutDashboard, UserPlus, ClipboardCheck, Eye, EyeOff, Save,
    AlertCircle, CheckCircle2, Clock, XCircle, Search, BarChart3,
    Lock, KeyRound, UserCog
} from 'lucide-react';

type AdminSection = 'beranda' | 'jurusan' | 'akun' | 'laporan' | 'pengaturan';
type Profile = { id: string; email: string; full_name: string; role: string; username: string; jurusan_id: string; permissions: any; created_at: string; };
type Jurusan = { id: string; nama: string; kode: string; jenjang: string; is_active: boolean; };
type LaporanMagang = { id: string; title: string; company: string; user_name: string; user_nim: string; user_prodi: string; status: string; created_at: string; approved_by: string; approved_at: string; rejection_reason: string; jurusan_id: string; };

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [activeSection, setActiveSection] = useState<AdminSection>('beranda');

    // Data states
    const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
    const [adminList, setAdminList] = useState<Profile[]>([]);
    const [laporanList, setLaporanList] = useState<LaporanMagang[]>([]);
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [stats, setStats] = useState({ users: 0, admins: 0, reports: 0, pendingReports: 0 });

    // UI states
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Modals
    const [showJurusanModal, setShowJurusanModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showEditAccountModal, setShowEditAccountModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editingJurusan, setEditingJurusan] = useState<Jurusan | null>(null);
    const [selectedLaporan, setSelectedLaporan] = useState<LaporanMagang | null>(null);
    const [editingAccount, setEditingAccount] = useState<Profile | null>(null);
    const [passwordTarget, setPasswordTarget] = useState<Profile | null>(null);

    // Form states
    const [jurusanForm, setJurusanForm] = useState({ nama: '', kode: '', jenjang: 'D3' });
    const [adminForm, setAdminForm] = useState({ email: '', password: '', fullName: '', username: '', role: 'dosen', jurusanId: '' });
    const [editAccountForm, setEditAccountForm] = useState({ fullName: '', username: '', role: 'dosen', jurusanId: '' });
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const supabase = createClient();

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const showError = (msg: string) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(null), 5000);
    };

    // Auth check
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!profile || (profile.role !== 'admin' && profile.role !== 'dosen')) {
                router.push('/login');
                return;
            }

            setCurrentUser(user);
            setCurrentProfile(profile);
            setIsLoading(false);
        };
        checkAdmin();
    }, [router]);

    // Load data based on section
    const loadData = useCallback(async () => {
        if (!currentUser) return;
        try {
            if (activeSection === 'beranda') {
                const [{ count: userCount }, { count: adminCount }, { count: reportCount }, { count: pendingCount }] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'dosen']),
                    supabase.from('laporan_magang').select('*', { count: 'exact', head: true }),
                    supabase.from('laporan_magang').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                ]);
                setStats({ users: userCount || 0, admins: adminCount || 0, reports: reportCount || 0, pendingReports: pendingCount || 0 });
            }
            if (activeSection === 'jurusan' || activeSection === 'akun' || activeSection === 'beranda') {
                const { data } = await supabase.from('jurusan').select('*').order('nama');
                setJurusanList(data || []);
            }
            if (activeSection === 'akun') {
                const { data } = await supabase.from('profiles').select('*').in('role', ['admin', 'dosen']).order('created_at', { ascending: false });
                setAdminList(data || []);
            }
            if (activeSection === 'laporan') {
                let query = supabase.from('laporan_magang').select('*').order('created_at', { ascending: false });
                // Dosen can only see their jurusan
                if (currentProfile?.role === 'dosen' && currentProfile?.jurusan_id) {
                    query = query.eq('jurusan_id', currentProfile.jurusan_id);
                }
                const { data } = await query;
                setLaporanList(data || []);
            }
            if (activeSection === 'pengaturan') {
                const { data } = await supabase.from('app_settings').select('*');
                const settingsMap: Record<string, any> = {};
                data?.forEach(s => { settingsMap[s.key] = { value: s.value, description: s.description }; });
                setSettings(settingsMap);
            }
        } catch (err) {
            console.error('Error loading data:', err);
        }
    }, [activeSection, currentUser, currentProfile]);

    useEffect(() => { loadData(); }, [loadData]);

    // CRUD: Jurusan
    const handleSaveJurusan = async () => {
        setActionLoading('jurusan');
        try {
            if (editingJurusan) {
                await supabase.from('jurusan').update({ nama: jurusanForm.nama, kode: jurusanForm.kode, jenjang: jurusanForm.jenjang }).eq('id', editingJurusan.id);
                showSuccess('Jurusan berhasil diupdate');
            } else {
                await supabase.from('jurusan').insert({ nama: jurusanForm.nama, kode: jurusanForm.kode, jenjang: jurusanForm.jenjang });
                showSuccess('Jurusan berhasil ditambahkan');
            }
            setShowJurusanModal(false);
            setJurusanForm({ nama: '', kode: '', jenjang: 'D3' });
            setEditingJurusan(null);
            loadData();
        } catch (err: any) { showError(err.message); }
        finally { setActionLoading(null); }
    };

    const handleDeleteJurusan = async (id: string) => {
        if (!confirm('Hapus jurusan ini?')) return;
        setActionLoading(id);
        await supabase.from('jurusan').delete().eq('id', id);
        showSuccess('Jurusan berhasil dihapus');
        loadData();
        setActionLoading(null);
    };

    // CRUD: Admin account
    const handleCreateAdmin = async () => {
        setActionLoading('admin');
        try {
            // Create user via Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: adminForm.email,
                password: adminForm.password,
                options: { data: { full_name: adminForm.fullName } },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Gagal membuat akun');

            // Wait a moment for the trigger to create profile
            await new Promise(r => setTimeout(r, 1000));

            // Update profile with role and username
            await supabase.from('profiles').update({
                role: adminForm.role,
                username: adminForm.username || null,
                jurusan_id: adminForm.jurusanId || null,
                full_name: adminForm.fullName,
                permissions: adminForm.role === 'dosen' ? { can_approve_laporan: true } : {},
            }).eq('id', authData.user.id);

            showSuccess(`Akun ${adminForm.role} berhasil dibuat`);
            setShowAdminModal(false);
            setAdminForm({ email: '', password: '', fullName: '', username: '', role: 'dosen', jurusanId: '' });
            loadData();
        } catch (err: any) { showError(err.message); }
        finally { setActionLoading(null); }
    };

    // Edit existing account profile
    const handleEditAccount = async () => {
        if (!editingAccount) return;
        setActionLoading('editAccount');
        try {
            const { error } = await supabase.from('profiles').update({
                full_name: editAccountForm.fullName,
                username: editAccountForm.username || null,
                role: editAccountForm.role,
                jurusan_id: editAccountForm.jurusanId || null,
                permissions: editAccountForm.role === 'dosen' ? { can_approve_laporan: true } : {},
            }).eq('id', editingAccount.id);
            if (error) throw error;
            showSuccess('Profil akun berhasil diperbarui');
            setShowEditAccountModal(false);
            setEditingAccount(null);
            // If editing own profile, refresh
            if (editingAccount.id === currentUser?.id) {
                const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
                if (updatedProfile) setCurrentProfile(updatedProfile);
            }
            loadData();
        } catch (err: any) { showError(err.message); }
        finally { setActionLoading(null); }
    };

    // Change password
    const handleChangePassword = async () => {
        if (!passwordTarget) return;
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showError('Password tidak cocok');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showError('Password minimal 6 karakter');
            return;
        }
        setActionLoading('password');
        try {
            // Use Supabase auth admin update (only works for own password via client)
            if (passwordTarget.id === currentUser?.id) {
                const { error } = await supabase.auth.updateUser({
                    password: passwordForm.newPassword,
                });
                if (error) throw error;
            } else {
                // For other users, we need admin API — call via server action or RPC
                // For now, use signUp workaround or notify
                showError('Untuk mengubah password user lain, gunakan Supabase Dashboard');
                setActionLoading(null);
                return;
            }
            showSuccess('Password berhasil diubah');
            setShowPasswordModal(false);
            setPasswordForm({ newPassword: '', confirmPassword: '' });
            setPasswordTarget(null);
        } catch (err: any) { showError(err.message); }
        finally { setActionLoading(null); }
    };

    // Delete account
    const handleDeleteAccount = async (account: Profile) => {
        if (account.id === currentUser?.id) {
            showError('Tidak bisa menghapus akun sendiri');
            return;
        }
        if (!confirm(`Hapus akun ${account.full_name || account.email}? Tindakan ini tidak bisa dibatalkan.`)) return;
        setActionLoading(account.id);
        try {
            // Delete profile (auth user remains but won't have admin access)
            await supabase.from('profiles').update({ role: 'mahasiswa', username: null, permissions: null }).eq('id', account.id);
            showSuccess('Akses admin/dosen dicabut');
            loadData();
        } catch (err: any) { showError(err.message); }
        finally { setActionLoading(null); }
    };

    // Laporan: approve/reject
    const handleApproveLaporan = async (laporan: LaporanMagang) => {
        setActionLoading(laporan.id);
        await supabase.from('laporan_magang').update({
            status: 'approved',
            approved_by: currentUser.id,
            approved_at: new Date().toISOString(),
        }).eq('id', laporan.id);
        showSuccess('Laporan disetujui');
        loadData();
        setActionLoading(null);
    };

    const handleRejectLaporan = async () => {
        if (!selectedLaporan) return;
        setActionLoading(selectedLaporan.id);
        await supabase.from('laporan_magang').update({
            status: 'rejected',
            approved_by: currentUser.id,
            approved_at: new Date().toISOString(),
            rejection_reason: rejectReason,
        }).eq('id', selectedLaporan.id);
        showSuccess('Laporan ditolak');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedLaporan(null);
        loadData();
        setActionLoading(null);
    };

    // Settings: save
    const handleSaveSetting = async (key: string, value: string) => {
        setActionLoading(key);
        await supabase.from('app_settings').update({
            value: JSON.parse(`"${value}"`),
            updated_at: new Date().toISOString(),
            updated_by: currentUser.id,
        }).eq('key', key);
        showSuccess('Pengaturan disimpan');
        setActionLoading(null);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Verifikasi akses...</p>
                </div>
            </div>
        );
    }

    const isAdmin = currentProfile?.role === 'admin';
    const isDosen = currentProfile?.role === 'dosen';

    const sidebarItems: { key: AdminSection; label: string; icon: any; adminOnly?: boolean }[] = [
        { key: 'beranda', label: 'Beranda', icon: LayoutDashboard },
        { key: 'jurusan', label: 'Kelola Jurusan', icon: GraduationCap, adminOnly: true },
        { key: 'akun', label: 'Kelola Akun', icon: Users, adminOnly: true },
        { key: 'laporan', label: 'Laporan Magang', icon: ClipboardCheck },
        { key: 'pengaturan', label: 'Pengaturan', icon: Settings, adminOnly: true },
    ];

    const filteredSidebarItems = sidebarItems.filter(item => !item.adminOnly || isAdmin);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed inset-y-0 left-0 z-30">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 dark:text-white text-sm">Admin Panel</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">E-Library Politeknik</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {filteredSidebarItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === item.key
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-sm font-bold">
                            {currentProfile?.full_name?.[0] || 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentProfile?.full_name || 'Admin'}</p>
                            <p className="text-xs text-gray-500 capitalize">{currentProfile?.role}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                if (currentProfile) {
                                    setEditingAccount(currentProfile);
                                    setEditAccountForm({
                                        fullName: currentProfile.full_name || '',
                                        username: currentProfile.username || '',
                                        role: currentProfile.role,
                                        jurusanId: currentProfile.jurusan_id || '',
                                    });
                                    setShowEditAccountModal(true);
                                }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <UserCog className="w-4 h-4" /> Edit Profil
                        </button>
                        <button
                            onClick={() => {
                                if (currentProfile) {
                                    setPasswordTarget(currentProfile);
                                    setPasswordForm({ newPassword: '', confirmPassword: '' });
                                    setShowPasswordModal(true);
                                }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <KeyRound className="w-4 h-4" /> Ubah Password
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                            <LogOut className="w-4 h-4" /> Keluar
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Top Notifications */}
                {successMsg && (
                    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                        <CheckCircle2 className="w-5 h-5" /> {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="w-5 h-5" /> {errorMsg}
                    </div>
                )}

                <div className="p-8">
                    {/* ==================== BERANDA ==================== */}
                    {activeSection === 'beranda' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Selamat Datang, {currentProfile?.full_name}!</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Ringkasan aktivitas dan statistik perpustakaan</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {[
                                    { label: 'Total Users', value: stats.users, icon: Users, color: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
                                    { label: 'Admin & Dosen', value: stats.admins, icon: Shield, color: 'purple', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600' },
                                    { label: 'Total Laporan', value: stats.reports, icon: FileText, color: 'green', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600' },
                                    { label: 'Menunggu Review', value: stats.pendingReports, icon: Clock, color: 'orange', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600' },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                                <stat.icon className={`w-5 h-5 ${stat.text}`} />
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</h3>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Aksi Cepat</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {isAdmin && (
                                        <>
                                            <button onClick={() => setActiveSection('jurusan')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <GraduationCap className="w-6 h-6 text-blue-500" />
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Kelola Jurusan</span>
                                            </button>
                                            <button onClick={() => { setActiveSection('akun'); setShowAdminModal(true); }} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <UserPlus className="w-6 h-6 text-purple-500" />
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Buat Akun Baru</span>
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => setActiveSection('laporan')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <ClipboardCheck className="w-6 h-6 text-green-500" />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Review Laporan</span>
                                    </button>
                                    {isAdmin && (
                                        <button onClick={() => setActiveSection('pengaturan')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <Settings className="w-6 h-6 text-orange-500" />
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Pengaturan</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== KELOLA JURUSAN ==================== */}
                    {activeSection === 'jurusan' && isAdmin && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Jurusan</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">Tambah, edit, atau hapus program studi</p>
                                </div>
                                <button
                                    onClick={() => { setEditingJurusan(null); setJurusanForm({ nama: '', kode: '', jenjang: 'D3' }); setShowJurusanModal(true); }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Tambah Jurusan
                                </button>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                                        <tr>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Nama Jurusan</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Kode</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Jenjang</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                                            <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {jurusanList.map(j => (
                                            <tr key={j.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{j.nama}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{j.kode}</td>
                                                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs rounded-md font-medium">{j.jenjang}</span></td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-md font-medium ${j.is_active ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-gray-100 text-gray-500'}`}>{j.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => { setEditingJurusan(j); setJurusanForm({ nama: j.nama, kode: j.kode || '', jenjang: j.jenjang || 'D3' }); setShowJurusanModal(true); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-blue-600">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteJurusan(j.id)} disabled={actionLoading === j.id} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-gray-500 hover:text-red-600">
                                                            {actionLoading === j.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {jurusanList.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Belum ada jurusan. Klik tombol di atas untuk menambahkan.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ==================== KELOLA AKUN ==================== */}
                    {activeSection === 'akun' && isAdmin && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Akun Admin & Dosen</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">Buat dan atur akun dengan hak akses khusus</p>
                                </div>
                                <button
                                    onClick={() => { setAdminForm({ email: '', password: '', fullName: '', username: '', role: 'dosen', jurusanId: '' }); setShowAdminModal(true); }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" /> Buat Akun Baru
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {adminList.map(admin => (
                                    <div key={admin.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${admin.role === 'admin' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                                {admin.full_name?.[0] || admin.email?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {admin.full_name || 'Tanpa nama'}
                                                    {admin.id === currentUser?.id && <span className="ml-2 text-xs text-blue-500 font-normal">(Anda)</span>}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>{admin.email}</span>
                                                    {admin.username && <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">@{admin.username}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${admin.role === 'admin' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'}`}>
                                                {admin.role === 'admin' ? 'Administrator' : 'Dosen'}
                                            </span>
                                            {admin.jurusan_id && (
                                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    {jurusanList.find(j => j.id === admin.jurusan_id)?.nama || '—'}
                                                </span>
                                            )}
                                            <div className="flex gap-1.5 ml-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingAccount(admin);
                                                        setEditAccountForm({
                                                            fullName: admin.full_name || '',
                                                            username: admin.username || '',
                                                            role: admin.role,
                                                            jurusanId: admin.jurusan_id || '',
                                                        });
                                                        setShowEditAccountModal(true);
                                                    }}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-blue-600"
                                                    title="Edit Profil"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPasswordTarget(admin);
                                                        setPasswordForm({ newPassword: '', confirmPassword: '' });
                                                        setShowPasswordModal(true);
                                                    }}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-orange-600"
                                                    title="Ubah Password"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </button>
                                                {admin.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => handleDeleteAccount(admin)}
                                                        disabled={actionLoading === admin.id}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-gray-500 hover:text-red-600"
                                                        title="Cabut Akses"
                                                    >
                                                        {actionLoading === admin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {adminList.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Belum ada akun admin/dosen.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ==================== LAPORAN MAGANG ==================== */}
                    {activeSection === 'laporan' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan Magang</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        {isDosen ? 'Review dan approve laporan jurusan Anda' : 'Review semua laporan magang yang masuk'}
                                    </p>
                                </div>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari laporan..."
                                        className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm w-64"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {laporanList
                                    .filter(l => !searchQuery || l.title?.toLowerCase().includes(searchQuery.toLowerCase()) || l.user_name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map(laporan => (
                                        <div key={laporan.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{laporan.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                        <span>{laporan.user_name} ({laporan.user_nim})</span>
                                                        <span>•</span>
                                                        <span>{laporan.company}</span>
                                                        <span>•</span>
                                                        <span>{laporan.user_prodi}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Diajukan: {new Date(laporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                    {laporan.status === 'approved' && laporan.approved_at && (
                                                        <p className="text-xs text-green-600 mt-1">✅ Disetujui pada {new Date(laporan.approved_at).toLocaleDateString('id-ID')}</p>
                                                    )}
                                                    {laporan.status === 'rejected' && laporan.rejection_reason && (
                                                        <p className="text-xs text-red-500 mt-1">❌ Ditolak: {laporan.rejection_reason}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${laporan.status === 'approved' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' :
                                                        laporan.status === 'rejected' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                                                            'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20'}`}>
                                                        {laporan.status === 'approved' ? 'Disetujui' : laporan.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                    </span>
                                                    {laporan.status === 'pending' && (
                                                        <div className="flex gap-1.5">
                                                            <button
                                                                onClick={() => handleApproveLaporan(laporan)}
                                                                disabled={actionLoading === laporan.id}
                                                                className="p-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                                                                title="Setujui"
                                                            >
                                                                {actionLoading === laporan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedLaporan(laporan); setShowRejectModal(true); }}
                                                                className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                                                title="Tolak"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {laporanList.length === 0 && (
                                    <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Belum ada laporan magang yang diajukan.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ==================== PENGATURAN ==================== */}
                    {activeSection === 'pengaturan' && isAdmin && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Aplikasi</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Konfigurasi teknis dan pengaturan umum</p>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(settings).map(([key, setting]) => (
                                    <SettingRow
                                        key={key}
                                        settingKey={key}
                                        value={typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value)}
                                        description={setting.description}
                                        onSave={handleSaveSetting}
                                        isLoading={actionLoading === key}
                                    />
                                ))}
                                {Object.keys(settings).length === 0 && (
                                    <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <Settings className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Belum ada pengaturan. Jalankan migrasi database terlebih dahulu.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ==================== MODALS ==================== */}

            {/* Jurusan Modal */}
            {showJurusanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingJurusan ? 'Edit Jurusan' : 'Tambah Jurusan Baru'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Nama Jurusan</label>
                                <input type="text" className="input w-full" placeholder="Contoh: Teknik Informatika" value={jurusanForm.nama} onChange={e => setJurusanForm(f => ({ ...f, nama: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Kode</label>
                                    <input type="text" className="input w-full" placeholder="TI" value={jurusanForm.kode} onChange={e => setJurusanForm(f => ({ ...f, kode: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Jenjang</label>
                                    <select className="input w-full" value={jurusanForm.jenjang} onChange={e => setJurusanForm(f => ({ ...f, jenjang: e.target.value }))}>
                                        <option value="D3">D3</option>
                                        <option value="D4">D4</option>
                                        <option value="S1">S1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end">
                            <button onClick={() => setShowJurusanModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Batal</button>
                            <button onClick={handleSaveJurusan} disabled={actionLoading === 'jurusan' || !jurusanForm.nama} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors">
                                {actionLoading === 'jurusan' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Account Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Buat Akun Baru</h3>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="text-sm font-medium block mb-1">Nama Lengkap</label>
                                <input type="text" className="input w-full" placeholder="Nama lengkap" value={adminForm.fullName} onChange={e => setAdminForm(f => ({ ...f, fullName: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Email</label>
                                <input type="email" className="input w-full" placeholder="email@polidewa.ac.id" value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Username (opsional, untuk login)</label>
                                <input type="text" className="input w-full" placeholder="username" value={adminForm.username} onChange={e => setAdminForm(f => ({ ...f, username: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Password</label>
                                <input type="password" className="input w-full" placeholder="Min. 8 karakter" value={adminForm.password} onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))} minLength={8} />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Role</label>
                                <select className="input w-full" value={adminForm.role} onChange={e => setAdminForm(f => ({ ...f, role: e.target.value }))}>
                                    <option value="dosen">Dosen</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            {adminForm.role === 'dosen' && (
                                <div>
                                    <label className="text-sm font-medium block mb-1">Assign Jurusan</label>
                                    <select className="input w-full" value={adminForm.jurusanId} onChange={e => setAdminForm(f => ({ ...f, jurusanId: e.target.value }))}>
                                        <option value="">— Pilih Jurusan —</option>
                                        {jurusanList.map(j => <option key={j.id} value={j.id}>{j.nama} ({j.jenjang})</option>)}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Dosen hanya bisa approve laporan dari jurusan ini.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end">
                            <button onClick={() => setShowAdminModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Batal</button>
                            <button onClick={handleCreateAdmin} disabled={actionLoading === 'admin' || !adminForm.email || !adminForm.password} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors">
                                {actionLoading === 'admin' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Buat Akun
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedLaporan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tolak Laporan</h3>
                            <p className="text-sm text-gray-500 mt-1">{selectedLaporan.title}</p>
                        </div>
                        <div className="p-6">
                            <label className="text-sm font-medium block mb-2">Alasan Penolakan</label>
                            <textarea className="input w-full h-32 resize-none" placeholder="Tuliskan alasan penolakan..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end">
                            <button onClick={() => { setShowRejectModal(false); setSelectedLaporan(null); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Batal</button>
                            <button onClick={handleRejectLaporan} disabled={actionLoading === selectedLaporan.id} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors">
                                {actionLoading === selectedLaporan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                Tolak Laporan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Account Modal */}
            {showEditAccountModal && editingAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Profil Akun</h3>
                            <p className="text-sm text-gray-500 mt-1">{editingAccount.email}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Nama Lengkap</label>
                                <input type="text" className="input w-full" value={editAccountForm.fullName} onChange={e => setEditAccountForm(f => ({ ...f, fullName: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Username</label>
                                <input type="text" className="input w-full" value={editAccountForm.username} onChange={e => setEditAccountForm(f => ({ ...f, username: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Role</label>
                                <select className="input w-full" value={editAccountForm.role} onChange={e => setEditAccountForm(f => ({ ...f, role: e.target.value }))}>
                                    <option value="dosen">Dosen</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            {editAccountForm.role === 'dosen' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Jurusan</label>
                                    <select className="input w-full" value={editAccountForm.jurusanId} onChange={e => setEditAccountForm(f => ({ ...f, jurusanId: e.target.value }))}>
                                        <option value="">— Pilih Jurusan —</option>
                                        {jurusanList.map(j => <option key={j.id} value={j.id}>{j.nama} ({j.jenjang})</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end">
                            <button onClick={() => { setShowEditAccountModal(false); setEditingAccount(null); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Batal</button>
                            <button onClick={handleEditAccount} disabled={actionLoading === 'editAccount'} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors">
                                {actionLoading === 'editAccount' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && passwordTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Lock className="w-5 h-5" /> Ubah Password
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{passwordTarget.full_name || passwordTarget.email}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {passwordTarget.id !== currentUser?.id && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400">⚠️ Untuk mengubah password user lain, gunakan Supabase Dashboard → Authentication → Users</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Password Baru</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        className="input w-full pr-10"
                                        placeholder="Min. 6 karakter"
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                                        disabled={passwordTarget.id !== currentUser?.id}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    className="input w-full"
                                    placeholder="Ketik ulang password baru"
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                    disabled={passwordTarget.id !== currentUser?.id}
                                />
                                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end">
                            <button onClick={() => { setShowPasswordModal(false); setPasswordTarget(null); setPasswordForm({ newPassword: '', confirmPassword: '' }); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Batal</button>
                            <button
                                onClick={handleChangePassword}
                                disabled={actionLoading === 'password' || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword || passwordTarget.id !== currentUser?.id}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
                            >
                                {actionLoading === 'password' ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                                Ubah Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Settings Row Component
function SettingRow({ settingKey, value, description, onSave, isLoading }: {
    settingKey: string; value: string; description: string; onSave: (key: string, value: string) => void; isLoading: boolean;
}) {
    const [editValue, setEditValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);

    const readableLabels: Record<string, string> = {
        books_per_page: 'Buku Per Halaman',
        api_results_limit: 'Batas Hasil API',
        allow_public_uploads: 'Izinkan Upload Publik',
        maintenance_mode: 'Mode Maintenance',
    };

    const isBool = editValue === 'true' || editValue === 'false';

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-center justify-between">
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{readableLabels[settingKey] || settingKey}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <div className="flex items-center gap-3 ml-4">
                {isBool ? (
                    <button
                        onClick={() => {
                            const newVal = editValue === 'true' ? 'false' : 'true';
                            setEditValue(newVal);
                            onSave(settingKey, newVal);
                        }}
                        disabled={isLoading}
                        className={`relative w-12 h-6 rounded-full transition-colors ${editValue === 'true' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${editValue === 'true' ? 'left-6' : 'left-0.5'}`} />
                    </button>
                ) : isEditing ? (
                    <div className="flex items-center gap-2">
                        <input type="text" className="input w-24 text-center py-1 text-sm" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                        <button onClick={() => { onSave(settingKey, editValue); setIsEditing(false); }} disabled={isLoading} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => { setEditValue(value); setIsEditing(false); }} className="p-1.5 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {value}
                        <Pencil className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
}
