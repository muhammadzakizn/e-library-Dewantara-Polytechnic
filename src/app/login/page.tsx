'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { checkEmailExists } from './actions';

const slideImages = [
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&q=80',
];

const quotes = [
    { text: "Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan, Anda dapat mengubah dunia.", author: "Nelson Mandela" },
    { text: "Investasi dalam pengetahuan selalu menghasilkan bunga yang terbaik.", author: "Benjamin Franklin" },
    { text: "Membaca adalah jendela ilmu, dan perpustakaan adalah pintunya.", author: "Pramoedya Ananta Toer" },
];

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'login' | 'register'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [nim, setNim] = useState('');
    const [prodi, setProdi] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Initial check state
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    // Image/Quote States
    const shuffledImages = useMemo(() => shuffleArray(slideImages), []);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(true);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    // Slideshow Effect
    useEffect(() => {
        const interval = setInterval(() => {
            setImageLoaded(false);
            setTimeout(() => {
                setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
                setImageLoaded(true);
                setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
            }, 500);
        }, 5000);
        return () => clearInterval(interval);
    }, [shuffledImages.length]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsCheckingEmail(true);
        setError(null);

        try {
            // Check if email exists via server action
            const result = await checkEmailExists(email);

            // Note: Since we haven't set up the RPC function yet, this might error or return false.
            // For a smooth UX without the RPC, we might want to default to 'login' 
            // if we are unsure, but let's assume the user will set up the SQL or we handle the error gracefully.

            if (result && result.exists) {
                setStep('login');
            } else {
                // If user doesn't exist (or RPC failed/missing), we guide them to register?
                // Actually, if RPC fails, 'exists' might be undefined.
                // Let's assume for this specific task that we want to show Registration if not found.
                // If exact check fails, maybe default to register? 
                // Let's rely on the result.
                setStep('register');
            }
        } catch (err) {
            console.error(err);
            // Fallback: If check fails, maybe just go to login and let Supabase handle the error?
            setStep('login');
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message === 'Invalid login credentials' ? 'Password salah atau akun bermasalah.' : error.message);
            setIsLoading(false);
            return;
        }

        router.push('/dashboard');
        router.refresh();
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name, nim, program_studi: prodi },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        // Auto login or show success? 
        // Usually signUp with email confirmation requires check email.
        // Let's show a success state or redirect.
        // For 'seamless', maybe we just say "Check email"?
        alert("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.");
        setStep('login'); // Go back to login or stay?
        setIsLoading(false);
    };

    const handleGoogleLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    const handleGitHubLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-950 overflow-hidden">
            {/* Left Side - Image Slideshow */}
            <div className="hidden lg:flex lg:w-1/2 p-2 relative transition-all duration-700 ease-in-out">
                <div className="relative overflow-hidden rounded-3xl w-full h-full">
                    <div className="absolute inset-0">
                        {shuffledImages.map((src, index) => (
                            <img
                                key={src}
                                src={src}
                                alt="Library"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex && imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            />
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-800/80 mix-blend-multiply" />

                    <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
                        <div className="flex items-center gap-3">
                            <img src="/logo-poltek.png" alt="Logo" className="w-10 h-10 object-contain brightness-0 invert" />
                            <div>
                                <h1 className="font-bold text-lg">E-Library</h1>
                                <p className="text-xs opacity-70">Politeknik Dewantara</p>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <h2 className="text-4xl font-bold mb-4 leading-tight">
                                {step === 'register' ? 'Bergabunglah dengan Ribuan Mahasiswa Lainnya' : 'Jelajahi Dunia Pengetahuan Tanpa Batas'}
                            </h2>
                            <p className="text-lg opacity-80 leading-relaxed">
                                {quotes[currentQuoteIndex].text}
                            </p>
                            <p className="mt-4 text-sm font-medium text-secondary-400">— {quotes[currentQuoteIndex].author}</p>
                        </div>

                        <div className="flex gap-2">
                            {shuffledImages.map((_, idx) => (
                                <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Unified Form */}
            <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 transition-all duration-500`}>
                <div className="w-full max-w-md space-y-8">

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-6">
                            <img src="/logo-poltek.png" alt="Logo" className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {step === 'email' ? 'Selamat Datang 👋' : step === 'login' ? 'Selamat Datang Kembali!' : 'Buat Akun Baru'}
                        </h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {step === 'email' ? 'Masuk atau daftar untuk melanjutkan akses perpustakaan.'
                                : step === 'login' ? `Masuk sebagai ${email}`
                                    : 'Lengkapi data diri Anda untuk mendaftar.'}
                        </p>
                    </div>

                    {/* Step 1: Email Input */}
                    {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Kampus / Pribadi</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        className="input pl-12 w-full py-3"
                                        placeholder="nama@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={isCheckingEmail} className="btn-primary w-full py-3 text-base flex justify-center items-center gap-2">
                                {isCheckingEmail ? <Loader2 className="animate-spin" /> : <>Lanjutkan <ArrowRight className="w-5 h-5" /></>}
                            </button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
                                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-gray-950 text-gray-500">Atau lanjutkan dengan</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={handleGoogleLogin} className="flex justify-center items-center py-2.5 border rounded-xl hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900 transition-colors">
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                    Google
                                </button>
                                <button type="button" onClick={handleGitHubLogin} className="flex justify-center items-center py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    GitHub
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Login (Password) */}
                    {step === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                        {email[0].toUpperCase()}
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900 dark:text-white">{email}</p>
                                        <p className="text-gray-500 text-xs">Akun Terdaftar</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setStep('email')} className="text-primary-600 text-sm hover:underline">Ubah</button>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                    <Link href="/lupa-password" className="text-xs text-primary-500 hover:underline">Lupa password?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="input pl-12 pr-12 w-full py-3"
                                        placeholder="Masukkan password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base flex justify-center items-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin" /> : <>Masuk <ArrowRight className="w-5 h-5" /></>}
                            </button>

                            <button type="button" onClick={() => setStep('email')} className="w-full text-center text-gray-500 text-sm hover:text-gray-800 dark:hover:text-gray-200 transaction-colors">
                                ← Kembali
                            </button>
                        </form>
                    )}

                    {/* Step 3: Register Details */}
                    {step === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center gap-3 mb-6">
                                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-medium">Email belum terdaftar</p>
                                    <p className="text-xs opacity-80">Silakan lengkapi data diri untuk mendaftar akun baru.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="text" required className="input pl-10" placeholder="Nama Anda" value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">NIM</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="text" required className="input pl-10" placeholder="NIM" value={nim} onChange={e => setNim(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Program Studi</label>
                                <select required className="input w-full" value={prodi} onChange={e => setProdi(e.target.value)}>
                                    <option value="">Pilih Program Studi</option>
                                    <option value="Teknologi Rekayasa Multimedia (D4)">Teknologi Rekayasa Multimedia (D4)</option>
                                    <option value="Teknologi Rekayasa Pangan (D4)">Teknologi Rekayasa Pangan (D4)</option>
                                    <option value="Teknologi Rekayasa Metalurgi (D4)">Teknologi Rekayasa Metalurgi (D4)</option>
                                    <option value="Arsitektur (D4)">Arsitektur (D4)</option>
                                    <option value="Teknik Sipil (D3)">Teknik Sipil (D3)</option>
                                    <option value="Teknik Elektronika (D3)">Teknik Elektronika (D3)</option>
                                    <option value="Teknik Mesin dan Otomotif (D3)">Teknik Mesin dan Otomotif (D3)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Buat Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="input pl-10 pr-10"
                                        placeholder="Min. 8 karakter"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        minLength={8}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin" /> : "Daftar Sekarang"}
                            </button>

                            <button type="button" onClick={() => setStep('email')} className="w-full text-center text-gray-500 text-sm hover:text-gray-800 transaction-colors">
                                ← Gunakan email lain
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
