'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

// Components
import AdminSidebar, { AdminSection } from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardHome from '@/components/admin/views/DashboardHome';
import UserManagement from '@/components/admin/views/UserManagement';
import LibraryManagement from '@/components/admin/views/LibraryManagement';
import SystemSettings from '@/components/admin/views/SystemSettings';

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<AdminSection>('beranda');
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const [stats, setStats] = useState({ users: 0, admins: 0, reports: 0, pendingReports: 0 });

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { router.push('/admin/login'); return; }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error || !profile || !['admin', 'dosen'].includes(profile.role)) {
                    router.push('/admin/login');
                    return;
                }

                setCurrentProfile(profile);
                fetchStats();
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/admin/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const fetchStats = async () => {
        // Fetch basic stats
        // This is a simplified fetch, actual implementation might need more robust counting
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mahasiswa');
        const { count: adminsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'dosen']);
        const { count: reportsCount } = await supabase.from('laporan_magang').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('laporan_magang').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        setStats({
            users: usersCount || 0,
            admins: adminsCount || 0,
            reports: reportsCount || 0,
            pendingReports: pendingCount || 0
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeSection) {
            case 'beranda':
                return <DashboardHome stats={stats} />;
            case 'pengguna':
                return <UserManagement />;
            case 'pustaka':
                return <LibraryManagement />;
            case 'pengaturan':
                return <SystemSettings />;
            default:
                return <DashboardHome stats={stats} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 font-sans">
            {/* Background Image / Gradient */}
            <div className="fixed inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900" />
                {/* Optional: Add background image here via CSS or Image component */}
            </div>

            <AdminSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onLogout={handleLogout}
                currentProfile={currentProfile}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <main className={`transition-all duration-300 flex-1 min-h-screen relative z-10 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <AdminHeader
                    title={
                        activeSection === 'beranda' ? 'Dashboard Overview' :
                            activeSection === 'pengguna' ? 'Manajemen Pengguna' :
                                activeSection === 'pustaka' ? 'Pustaka Digital' : 'Pengaturan'
                    }
                    user={currentProfile}
                />

                <div className="p-6 lg:p-8 pt-4 pb-20 w-full">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
