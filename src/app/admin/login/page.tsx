'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Shield, Lock, LayoutDashboard, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = createClient();

        try {
            // 1. Authenticate User
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError || !user) {
                throw new Error('Email atau password salah');
            }

            // 2. Check Admin Role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                await supabase.auth.signOut();
                throw new Error('Akses ditolak. Akun ini bukan administrator.');
            }

            // 3. Redirect to Admin Dashboard
            router.push('/admin/dashboard');

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                            <Shield className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                        <p className="text-gray-400 text-sm mt-1">E-Library Politeknik Dewantara</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Administrator</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="admin@polidewa.ac.id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Checking Access...
                                </>
                            ) : (
                                <>
                                    Login to Dashboard
                                    <LayoutDashboard className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-900/50 p-4 text-center border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                        Protected System. Unauthorized access is prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
}
