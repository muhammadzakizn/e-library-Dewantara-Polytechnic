'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Mail, AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LupaPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl text-center border border-gray-100 dark:border-gray-800">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Terkirim!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Silakan cek inbox email Anda ({email}) untuk link reset password.
                    </p>
                    <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-500/5 rounded-full blur-3xl" />
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-secondary-500/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 relative z-10 transition-all duration-300 hover:shadow-2xl">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Link href="/login" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lupa Password</h1>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Masukkan email yang terdaftar untuk menerima link reset password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="input pl-12 w-full"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex justify-center items-center gap-2 shadow-lg shadow-primary-500/20">
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Kirim Link Reset <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
