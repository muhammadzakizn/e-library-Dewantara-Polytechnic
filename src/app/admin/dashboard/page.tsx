'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Users, BookOpen, FileText, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/admin/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                router.push('/login'); // Kick non-admins
            } else {
                setIsLoading(false); // Allow access
            }
        };

        checkAdmin();
    }, [router]);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500">Verifying privileges...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Admin Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md">ADMIN</span>
                        Dashboard
                    </h1>
                    <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Exit
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Users', value: '1,234', icon: Users, color: 'blue' },
                        { label: 'Total Books', value: '856', icon: BookOpen, color: 'green' },
                        { label: 'Reports', value: '45', icon: FileText, color: 'orange' },
                        { label: 'Active Now', value: '12', icon: Activity, color: 'purple' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</span>
                                <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Welcome to Admin Area</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Select a menu item to manage the application.
                    </p>
                </div>
            </main>
        </div>
    );
}
