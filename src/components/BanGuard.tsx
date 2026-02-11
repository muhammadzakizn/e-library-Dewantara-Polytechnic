'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldX, LogOut, Mail } from 'lucide-react';

interface BanGuardProps {
    children: React.ReactNode;
    userId?: string;
}

export default function BanGuard({ children, userId }: BanGuardProps) {
    const [isBanned, setIsBanned] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (!userId) {
            setChecking(false);
            return;
        }

        const supabase = createClient();

        const checkBan = async () => {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_banned, ban_reason')
                    .eq('id', userId)
                    .single();

                setIsBanned(data?.is_banned === true);
                setBanReason(data?.ban_reason || '');
            } catch {
                setIsBanned(false);
            } finally {
                setChecking(false);
            }
        };

        checkBan();

        // Re-check every 60 seconds
        const interval = setInterval(checkBan, 60000);
        return () => clearInterval(interval);
    }, [userId]);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (checking) return null;
    if (!isBanned) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-950/30 to-gray-900">
            <div className="relative max-w-md w-full mx-4">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-red-500/15 rounded-3xl blur-3xl" />

                <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-8 text-center shadow-2xl">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center">
                        <ShieldX className="w-10 h-10 text-red-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">
                        Akun Anda Dibatasi
                    </h1>

                    <p className="text-gray-300 mb-4 leading-relaxed">
                        Akses akun Anda telah dibatasi oleh administrator.
                    </p>

                    {banReason && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-left">
                            <p className="text-xs text-red-300/70 uppercase font-medium tracking-wider mb-1">Alasan</p>
                            <p className="text-red-200 text-sm">{banReason}</p>
                        </div>
                    )}

                    <p className="text-gray-400 text-sm mb-8">
                        Hubungi administrator atau pengelola perpustakaan untuk informasi lebih lanjut.
                    </p>

                    <div className="flex flex-col gap-3">
                        <a
                            href="mailto:admin@polidewa.ac.id"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                        >
                            <Mail className="w-4 h-4" />
                            Hubungi Admin
                        </a>
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
