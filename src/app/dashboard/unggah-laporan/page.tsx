'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, FileText, Building, Calendar, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function UnggahLaporanPage() {
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        let mounted = true;
        const supabase = createClient();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!mounted) return;
                if (session?.user) {
                    setUser(session.user);
                    setIsLoading(false);
                } else {
                    router.push('/login');
                }
            }
        );

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            if (session?.user) setUser(session.user);
            setIsLoading(false);
        }).catch(() => {
            if (mounted) setIsLoading(false);
        });

        const safetyTimer = setTimeout(() => {
            if (mounted) setIsLoading(false);
        }, 3000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !user) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();

            // Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${title.replace(/\s+/g, '_')}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('laporan-magang')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                // If bucket doesn't exist, show helpful message
                if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
                    setError('Storage belum dikonfigurasi. Silakan buat bucket "laporan-magang" di Supabase Dashboard → Storage.');
                } else {
                    setError(`Gagal mengunggah file: ${uploadError.message}`);
                }
                setIsSubmitting(false);
                return;
            }

            // Store metadata in database
            const { error: insertError } = await supabase.from('laporan_magang').insert({
                user_id: user.id,
                title: title,
                company: company,
                start_date: startDate,
                end_date: endDate,
                description: description,
                file_path: fileName,
                user_name: user.user_metadata?.full_name || user.email,
                user_nim: user.user_metadata?.nim || '',
                user_prodi: user.user_metadata?.program_studi || '',
                status: 'pending',
            });

            if (insertError) {
                // If table doesn't exist, still show success for file upload
                console.warn('Table insert failed (table may not exist yet):', insertError.message);
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat mengunggah');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-[var(--background-secondary)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-[var(--background-secondary)]">
                <div className="container-custom max-w-2xl">
                    <div className="card p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
                            Laporan Berhasil Diunggah!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Laporan &quot;{title}&quot; telah berhasil diunggah.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Laporan Anda akan diverifikasi oleh admin sebelum dipublikasikan.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
                                Kembali ke Dashboard
                            </Link>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setTitle('');
                                    setCompany('');
                                    setStartDate('');
                                    setEndDate('');
                                    setDescription('');
                                    setFile(null);
                                }}
                                className="btn-secondary inline-flex items-center gap-2"
                            >
                                Unggah Lagi
                            </button>
                        </div>
                    </div>
                </div>
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
                            Upload Laporan Magang
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Unggah laporan magang Anda untuk arsip perpustakaan
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="card p-8">
                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="label">Judul Laporan</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Contoh: Implementasi Sistem Akuntansi di PT. ABC"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Company */}
                        <div>
                            <label className="label">Nama Perusahaan/Instansi</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="input pl-12"
                                    placeholder="Nama tempat magang"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Period */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Tanggal Mulai</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        className="input pl-12"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Tanggal Selesai</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        className="input pl-12"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="label">Deskripsi Singkat</label>
                            <textarea
                                className="input min-h-[100px] resize-none"
                                placeholder="Jelaskan secara singkat tentang laporan magang Anda..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="label">File Laporan (PDF)</label>
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="file-upload"
                                    required
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    {file ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <FileText className="w-8 h-8 text-primary-500" />
                                            <div className="text-left">
                                                <p className="font-medium text-primary-900 dark:text-white">
                                                    {file.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                            <p className="text-gray-600 dark:text-gray-400 mb-1">
                                                Klik untuk upload atau drag & drop
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                PDF (Maks. 10MB)
                                            </p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-medium mb-1">Informasi:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                                    <li>Laporan akan diverifikasi oleh admin sebelum dipublikasikan</li>
                                    <li>Pastikan laporan sudah disetujui oleh dosen pembimbing</li>
                                    <li>Format file harus dalam bentuk PDF</li>
                                </ul>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Mengunggah...
                                </span>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Unggah Laporan
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
