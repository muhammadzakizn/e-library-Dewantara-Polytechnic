'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Password tidak sama");
            return;
        }

        if (password.length < 8) {
            setError("Password minimal 8 karakter");
            return;
        }

        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setIsLoading(false);

        // Redirect after delay
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl text-center border border-gray-100 dark:border-gray-800">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Diperbarui!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Anda akan dialihkan ke dashboard dalam beberapa detik...
                    </p>
                    <Link href="/dashboard" className="btn-primary w-full flex items-center justify-center gap-2">
                        Ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Buat Password Baru</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    Silakan masukkan password baru untuk akun Anda.
                </p>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Baru</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="input pl-12 pr-12 w-full"
                                placeholder="Min. 8 karakter"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Konfirmasi Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="input pl-12 pr-12 w-full"
                                placeholder="Ulangi password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Simpan Password Baru"}
                    </button>
                </form>
            </div>
        </div>
    );
}
