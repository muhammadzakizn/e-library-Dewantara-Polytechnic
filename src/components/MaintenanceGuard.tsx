'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Wrench, LogOut, RefreshCw } from 'lucide-react';

interface MaintenanceGuardProps {
    children: React.ReactNode;
}

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        const checkMaintenance = async () => {
            try {
                const { data } = await supabase
                    .from('app_settings')
                    .select('key, value')
                    .in('key', ['maintenance_mode', 'maintenance_message']);

                const modeRow = data?.find(r => r.key === 'maintenance_mode');
                const msgRow = data?.find(r => r.key === 'maintenance_message');

                const isActive = modeRow?.value === true || modeRow?.value === 'true';
                setIsMaintenance(isActive);
                setMaintenanceMessage(
                    typeof msgRow?.value === 'string'
                        ? msgRow.value.replace(/^"|"$/g, '')
                        : 'Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti.'
                );
            } catch {
                // If we can't check, allow access
                setIsMaintenance(false);
            } finally {
                setChecking(false);
            }
        };

        checkMaintenance();

        // Poll every 30 seconds
        const interval = setInterval(checkMaintenance, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (checking) return null; // Don't block while checking
    if (!isMaintenance) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="relative max-w-md w-full mx-4">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-amber-500/20 rounded-3xl blur-3xl" />

                <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-8 text-center shadow-2xl">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <Wrench className="w-10 h-10 text-amber-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">
                        Sedang Dalam Pemeliharaan
                    </h1>

                    <p className="text-gray-300 mb-8 leading-relaxed">
                        {maintenanceMessage}
                    </p>

                    {/* Animated dots */}
                    <div className="flex items-center justify-center gap-1.5 mb-8">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Coba Lagi
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Keluar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
