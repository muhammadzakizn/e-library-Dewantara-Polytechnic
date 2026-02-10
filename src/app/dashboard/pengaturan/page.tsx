'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Settings,
    Link2,
    Unlink,
    Loader2,
    CheckCircle,
    AlertCircle,
    Shield,
    Mail,
    Clock,
    LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface LinkedAccount {
    provider: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    connected: boolean;
    email?: string;
    identity_id?: string;
}

export default function PengaturanPage() {
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const supabase = createClient();

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);
            setIsLoading(false);
        };

        getUser();
    }, [router]);

    const getLinkedAccounts = (): LinkedAccount[] => {
        if (!user) return [];

        const identities = user.identities || [];

        const googleIdentity = identities.find(i => i.provider === 'google');
        const githubIdentity = identities.find(i => i.provider === 'github');

        return [
            {
                provider: 'google',
                label: 'Google',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                ),
                color: 'border-blue-200 dark:border-blue-800',
                connected: !!googleIdentity,
                email: googleIdentity?.identity_data?.email,
                identity_id: googleIdentity?.id,
            },
            {
                provider: 'github',
                label: 'GitHub',
                icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                ),
                color: 'border-gray-300 dark:border-gray-600',
                connected: !!githubIdentity,
                email: githubIdentity?.identity_data?.email,
                identity_id: githubIdentity?.id,
            },
        ];
    };

    const handleLinkAccount = async (provider: 'google' | 'github') => {
        setActionLoading(provider);
        setMessage(null);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.linkIdentity({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/pengaturan`,
                },
            });

            if (error) {
                setMessage({ type: 'error', text: `Gagal menghubungkan ${provider}: ${error.message}` });
                setActionLoading(null);
            }
            // If successful, the user gets redirected
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan' });
            setActionLoading(null);
        }
    };

    const handleUnlinkAccount = async (provider: string, identityId: string) => {
        // Prevent unlinking the last identity
        const identities = user?.identities || [];
        if (identities.length <= 1) {
            setMessage({ type: 'error', text: 'Tidak dapat memutuskan tautan. Minimal satu akun harus terhubung.' });
            return;
        }

        setActionLoading(provider);
        setMessage(null);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.unlinkIdentity({
                provider,
                id: identityId,
            } as any);

            if (error) {
                setMessage({ type: 'error', text: `Gagal memutuskan tautan: ${error.message}` });
            } else {
                setMessage({ type: 'success', text: `Akun ${provider} berhasil diputuskan tautannya.` });
                // Refresh user data
                const { data: { user: updatedUser } } = await supabase.auth.getUser();
                setUser(updatedUser);
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const linkedAccounts = getLinkedAccounts();
    const loginProvider = user?.app_metadata?.provider || 'email';
    const createdAt = user?.created_at ? new Date(user.created_at) : null;
    const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : null;

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-[var(--background-secondary)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[var(--background-secondary)]">
            <div className="container-custom max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-primary-900 dark:text-white">
                            Pengaturan Akun
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Kelola akun dan tautan platform Anda
                        </p>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>{message.text}</p>
                    </div>
                )}

                {/* Account Info */}
                <div className="card p-6 mb-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-500" />
                        </div>
                        <h2 className="text-lg font-bold text-primary-900 dark:text-white">
                            Informasi Akun
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 mb-0.5">Metode Login Utama</p>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                    {loginProvider === 'email' ? 'Email & Password' : loginProvider}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 mb-0.5">Akun dibuat</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {createdAt?.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 mb-0.5">Login terakhir</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {lastSignIn?.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linked Accounts */}
                <div className="card p-6 mb-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-primary-900 dark:text-white">
                                Tautan Akun
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Hubungkan akun untuk login dari platform lain
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {linkedAccounts.map((account) => (
                            <div
                                key={account.provider}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${account.connected
                                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                                        {account.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {account.label}
                                        </p>
                                        {account.connected ? (
                                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Terhubung{account.email ? ` • ${account.email}` : ''}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400">
                                                Belum terhubung
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {account.connected ? (
                                    <button
                                        onClick={() => handleUnlinkAccount(account.provider, account.identity_id!)}
                                        disabled={actionLoading === account.provider || (user?.identities?.length || 0) <= 1}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={(user?.identities?.length || 0) <= 1 ? 'Minimal satu akun harus terhubung' : ''}
                                    >
                                        {actionLoading === account.provider ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Unlink className="w-3.5 h-3.5" />
                                        )}
                                        Putuskan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleLinkAccount(account.provider as 'google' | 'github')}
                                        disabled={actionLoading === account.provider}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === account.provider ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Link2 className="w-3.5 h-3.5" />
                                        )}
                                        Hubungkan
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                        Menghubungkan akun memungkinkan Anda untuk login menggunakan platform tersebut.
                        Minimal satu akun harus tetap terhubung.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-bold text-primary-900 dark:text-white mb-4">
                        Lainnya
                    </h2>
                    <div className="space-y-2">
                        <Link
                            href="/dashboard/profil"
                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                        >
                            <span className="text-sm text-gray-700 dark:text-gray-300">Edit Profil</span>
                            <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800/50 transition-colors font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Keluar dari Akun
                </button>
            </div>
        </div>
    );
}
