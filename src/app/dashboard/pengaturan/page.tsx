'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import {
    User,
    Mail,
    GraduationCap,
    BookOpen,
    Save,
    ArrowLeft,
    Camera,
    Loader2,
    CheckCircle,
    AlertCircle,
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Trash2,
    Settings,
    Link2,
    Unlink,
    Shield,
    Clock,
    LogOut,
    ChevronRight,
    KeyRound,
    Menu,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// -------- Image processing utilities --------

async function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    const outputSize = Math.min(256, pixelCrop.width, pixelCrop.height);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const outputCtx = outputCanvas.getContext('2d')!;
    outputCtx.drawImage(canvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, outputSize, outputSize);

    let quality = 0.8;
    let blob = await canvasToBlob(outputCanvas, 'image/webp', quality);

    while (blob.size > 500 * 1024 && quality > 0.1) {
        quality -= 0.05;
        blob = await canvasToBlob(outputCanvas, 'image/webp', quality);
    }

    return blob;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => resolve(blob!),
            type,
            quality
        );
    });
}

// -------- Linked Account type --------

interface LinkedAccount {
    provider: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    connected: boolean;
    email?: string;
    identity_id?: string;
}

// -------- Sidebar Menu Items --------

type SettingsSection = 'profil' | 'akun' | 'keamanan';

const sidebarItems: { id: SettingsSection; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'profil', label: 'Profil Publik', icon: <User className="w-4 h-4" />, description: 'Foto, nama, dan informasi akademik' },
    { id: 'akun', label: 'Akun', icon: <Settings className="w-4 h-4" />, description: 'Email, tautan akun, dan info akun' },
    { id: 'keamanan', label: 'Keamanan', icon: <KeyRound className="w-4 h-4" />, description: 'Password dan keamanan akun' },
];

// -------- Component --------

export default function PengaturanPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Active section
    const initialSection = (searchParams.get('tab') as SettingsSection) || 'profil';
    const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);

    // Profile form data
    const [fullName, setFullName] = useState('');
    const [nim, setNim] = useState('');
    const [prodi, setProdi] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);

    // Photo crop state
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const supabase = createClient();

        const handleUser = (sessionUser: import('@supabase/supabase-js').User | null | undefined) => {
            if (!mounted) return;
            if (!sessionUser) {
                router.push('/login');
                return;
            }
            setUser(sessionUser);
            setFullName(sessionUser.user_metadata?.full_name || '');
            setNim(sessionUser.user_metadata?.nim || '');
            setProdi(sessionUser.user_metadata?.program_studi || '');
            setCustomAvatarUrl(sessionUser.user_metadata?.custom_avatar_url || null);
            setIsLoading(false);
        };

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => handleUser(session?.user)
        );

        // Immediate check from cache
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleUser(session?.user);

            // Background refresh with fresh server data (5s timeout)
            if (session?.user) {
                Promise.race([
                    supabase.auth.getUser(),
                    new Promise((_, reject) => setTimeout(() => reject('timeout'), 5000))
                ]).then((result: any) => {
                    if (mounted && result?.data?.user) {
                        handleUser(result.data.user);
                    }
                }).catch(() => { });
            }
        }).catch(() => {
            if (mounted) setIsLoading(false);
        });

        // Safety timeout
        const safetyTimer = setTimeout(() => {
            if (mounted) setIsLoading(false);
        }, 3000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, [router]);

    const switchSection = (section: SettingsSection) => {
        setActiveSection(section);
        setMessage(null);
        setShowMobileSidebar(false);
        // Update URL without reload
        window.history.replaceState(null, '', `/dashboard/pengaturan?tab=${section}`);
    };

    // -------- Profile handlers --------

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Hanya file gambar yang diperbolehkan' });
            return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result as string);
            setShowCropModal(true);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
        });
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropSave = async () => {
        if (!imageSrc || !croppedAreaPixels || !user) return;
        setIsUploadingPhoto(true);
        setMessage(null);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            const supabase = createClient();
            if (customAvatarUrl) {
                const oldPath = customAvatarUrl.split('/avatars/').pop();
                if (oldPath) await supabase.storage.from('avatars').remove([oldPath]);
            }
            const fileName = `${user.id}/${Date.now()}.webp`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, croppedBlob, { contentType: 'image/webp', cacheControl: '3600', upsert: true });
            if (uploadError) {
                if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
                    setMessage({ type: 'error', text: 'Storage belum dikonfigurasi. Buat bucket "avatars" di Supabase Dashboard → Storage.' });
                } else {
                    setMessage({ type: 'error', text: `Gagal upload foto: ${uploadError.message}` });
                }
                setIsUploadingPhoto(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            const { error: updateError } = await supabase.auth.updateUser({
                data: { custom_avatar_url: publicUrl, avatar_url: publicUrl },
            });
            if (updateError) {
                setMessage({ type: 'error', text: updateError.message });
            } else {
                setCustomAvatarUrl(publicUrl);
                setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) setUser(session.user);
            }
            setShowCropModal(false);
            setImageSrc(null);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Gagal upload foto' });
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleRemoveCustomPhoto = async () => {
        if (!user) return;
        setIsUploadingPhoto(true);
        setMessage(null);
        try {
            const supabase = createClient();
            if (customAvatarUrl) {
                const oldPath = customAvatarUrl.split('/avatars/').pop();
                if (oldPath) await supabase.storage.from('avatars').remove([oldPath]);
            }
            const googleAvatar = user.user_metadata?.picture || null;
            const { error } = await supabase.auth.updateUser({
                data: { custom_avatar_url: null, avatar_url: googleAvatar },
            });
            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setCustomAvatarUrl(null);
                setMessage({ type: 'success', text: 'Foto profil dikembalikan ke default' });
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) setUser(session.user);
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName, nim, program_studi: prodi },
        });
        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) setUser(session.user);
        }
        setIsSaving(false);
    };

    // -------- Linked accounts handlers --------

    const getLinkedAccounts = (): LinkedAccount[] => {
        if (!user) return [];
        const identities = user.identities || [];
        const googleIdentity = identities.find(i => i.provider === 'google');
        const githubIdentity = identities.find(i => i.provider === 'github');
        return [
            {
                provider: 'google', label: 'Google',
                icon: (<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>),
                color: 'border-blue-200 dark:border-blue-800',
                connected: !!googleIdentity, email: googleIdentity?.identity_data?.email, identity_id: googleIdentity?.id,
            },
            {
                provider: 'github', label: 'GitHub',
                icon: (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>),
                color: 'border-gray-300 dark:border-gray-600',
                connected: !!githubIdentity, email: githubIdentity?.identity_data?.email, identity_id: githubIdentity?.id,
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
                options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/pengaturan?tab=akun` },
            });
            if (error) {
                setMessage({ type: 'error', text: `Gagal menghubungkan ${provider}: ${error.message}` });
                setActionLoading(null);
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan' });
            setActionLoading(null);
        }
    };

    const handleUnlinkAccount = async (provider: string, identityId: string) => {
        const identities = user?.identities || [];
        if (identities.length <= 1) {
            setMessage({ type: 'error', text: 'Tidak dapat memutuskan tautan. Minimal satu akun harus terhubung.' });
            return;
        }
        setActionLoading(provider);
        setMessage(null);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.unlinkIdentity({ provider, id: identityId } as any);
            if (error) {
                setMessage({ type: 'error', text: `Gagal memutuskan tautan: ${error.message}` });
            } else {
                setMessage({ type: 'success', text: `Akun ${provider} berhasil diputuskan tautannya.` });
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) setUser(session.user);
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan' });
        } finally {
            setActionLoading(null);
        }
    };

    // -------- Password handler --------

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Kata sandi baru dan konfirmasi tidak cocok.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Kata sandi minimal 6 karakter.' });
            return;
        }
        setIsChangingPassword(true);
        setMessage(null);
        try {
            const supabase = createClient();

            // Verify current password first
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || '',
                password: currentPassword,
            });
            if (signInError) {
                setMessage({ type: 'error', text: 'Kata sandi saat ini salah.' });
                setIsChangingPassword(false);
                return;
            }

            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: 'Kata sandi berhasil diubah! Silakan cek email Anda untuk konfirmasi perubahan.' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!user?.email) return;
        setIsSendingReset(true);
        setMessage(null);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/pengaturan?tab=keamanan`,
            });
            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: `Link reset kata sandi telah dikirim ke ${user.email}. Silakan cek inbox Anda.` });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsSendingReset(false);
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
    const displayAvatar = customAvatarUrl || user?.user_metadata?.avatar_url || null;
    const isGooglePhoto = !customAvatarUrl && !!user?.user_metadata?.avatar_url;

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-[var(--background-secondary)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[var(--background-secondary)]">
            <div className="container-custom max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            {displayAvatar ? (
                                <img src={displayAvatar} alt={fullName} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">{fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-primary-900 dark:text-white">
                                    {fullName || 'Pengaturan'}
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pengaturan akun Anda</p>
                            </div>
                        </div>
                    </div>
                    {/* Mobile sidebar toggle */}
                    <button
                        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex gap-6 relative">
                    {/* ======== Sidebar ======== */}
                    {/* Desktop sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <nav className="sticky top-28 space-y-1">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => switchSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeSection === item.id
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-l-4 border-primary-500 pl-3'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}

                            <div className="border-t border-gray-200 dark:border-gray-700 my-3 !mt-4" />

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </button>
                        </nav>
                    </aside>

                    {/* Mobile sidebar */}
                    {showMobileSidebar && (
                        <div className="lg:hidden fixed inset-0 z-50">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
                            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-2xl p-6 animate-in slide-in-from-right duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-primary-900 dark:text-white">Menu</h3>
                                    <button onClick={() => setShowMobileSidebar(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                                <nav className="space-y-1">
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => switchSection(item.id)}
                                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === item.id
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <span className="flex items-center gap-3">{item.icon}{item.label}</span>
                                            <ChevronRight className="w-4 h-4 opacity-40" />
                                        </button>
                                    ))}
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Keluar
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )}

                    {/* Mobile tab bar */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40 px-2 py-1 flex justify-around">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => switchSection(item.id)}
                                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs transition-colors ${activeSection === item.id
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {item.icon}
                                <span className="truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>

                    {/* ======== Main Content ======== */}
                    <main className="flex-1 min-w-0 pb-20 lg:pb-0">
                        {/* Message */}
                        {message && (
                            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                }`}>
                                {message.type === 'success'
                                    ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                }
                                <p className={`text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {message.text}
                                </p>
                                <button onClick={() => setMessage(null)} className="ml-auto flex-shrink-0 p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors">
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        )}

                        {/* ======== Profil Section ======== */}
                        {activeSection === 'profil' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">Profil Publik</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Informasi ini akan ditampilkan pada profil Anda</p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Left: Form */}
                                    <form onSubmit={handleSaveProfile} className="flex-1 space-y-5 order-2 md:order-1">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Masukkan nama lengkap"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Nama Anda akan muncul di profil perpustakaan.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                                                value={user?.email || ''}
                                                readOnly
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">NIM</label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Masukkan NIM"
                                                value={nim}
                                                onChange={(e) => setNim(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Program Studi</label>
                                            <select
                                                className="input"
                                                value={prodi}
                                                onChange={(e) => setProdi(e.target.value)}
                                            >
                                                <option value="">Pilih program studi</option>
                                                <option value="Teknologi Rekayasa Multimedia (D4)">Teknologi Rekayasa Multimedia (D4)</option>
                                                <option value="Teknologi Rekayasa Pangan (D4)">Teknologi Rekayasa Pangan (D4)</option>
                                                <option value="Teknologi Rekayasa Metalurgi (D4)">Teknologi Rekayasa Metalurgi (D4)</option>
                                                <option value="Arsitektur (D4)">Arsitektur (D4)</option>
                                                <option value="Teknik Sipil (D3)">Teknik Sipil (D3)</option>
                                                <option value="Teknik Elektronika (D3)">Teknik Elektronika (D3)</option>
                                                <option value="Teknik Mesin dan Otomotif (D3)">Teknik Mesin dan Otomotif (D3)</option>
                                            </select>
                                        </div>

                                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <button type="submit" disabled={isSaving} className="btn-primary px-6">
                                                {isSaving ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Menyimpan...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <Save className="w-4 h-4" />
                                                        Simpan Profil
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Right: Avatar */}
                                    <div className="flex flex-col items-center gap-4 order-1 md:order-2 md:w-48">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Foto Profil</label>
                                        <div className="relative group">
                                            {displayAvatar ? (
                                                <img
                                                    src={displayAvatar}
                                                    alt={fullName}
                                                    className="w-40 h-40 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-gray-700"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-700">
                                                    <span className="text-6xl font-bold text-white">
                                                        {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <label
                                                htmlFor="avatar-upload"
                                                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <Camera className="w-8 h-8 text-white" />
                                            </label>
                                            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                                className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors"
                                            >
                                                <Camera className="w-3.5 h-3.5" />
                                                {displayAvatar ? 'Ganti foto' : 'Upload foto'}
                                            </button>
                                            {isGooglePhoto && <p className="text-xs text-gray-400">Foto dari Google</p>}
                                            {customAvatarUrl && (
                                                <button
                                                    onClick={handleRemoveCustomPhoto}
                                                    disabled={isUploadingPhoto}
                                                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Hapus foto kustom
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ======== Akun Section ======== */}
                        {activeSection === 'akun' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">Akun</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Informasi akun dan metode login Anda</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="card p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Email</p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-purple-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Metode Login Utama</p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                                    {loginProvider === 'email' ? 'Email & Password' : loginProvider}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="card p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Akun Dibuat</p>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                        {createdAt?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Login Terakhir</p>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                        {lastSignIn?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tautan Akun */}
                                    <div className="pt-2">
                                        <h3 className="text-base font-semibold text-primary-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Link2 className="w-4 h-4 text-gray-400" />
                                            Tautan Akun
                                        </h3>
                                        <div className="space-y-3">
                                            {linkedAccounts.map((account) => (
                                                <div
                                                    key={account.provider}
                                                    className={`card p-5 flex items-center justify-between transition-all ${account.connected
                                                        ? 'ring-1 ring-green-200 dark:ring-green-800'
                                                        : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                            {account.icon}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{account.label}</p>
                                                            {account.connected ? (
                                                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Terhubung{account.email ? ` • ${account.email}` : ''}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-gray-400">Belum terhubung</p>
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
                                                            {actionLoading === account.provider ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                                                            Putuskan
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleLinkAccount(account.provider as 'google' | 'github')}
                                                            disabled={actionLoading === account.provider}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {actionLoading === account.provider ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                                                            Hubungkan
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Hubungkan akun untuk login dari platform lain. Minimal satu akun harus terhubung.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ======== Keamanan Section ======== */}
                        {activeSection === 'keamanan' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">Keamanan</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola password dan keamanan akun Anda</p>
                                </div>

                                <div className="card p-6">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Ubah Kata Sandi</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Pastikan akun Anda menggunakan kata sandi yang kuat dan unik. Setelah berhasil mengubah, Anda akan menerima email konfirmasi.</p>

                                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kata Sandi Saat Ini</label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="password"
                                                    className="input pl-10"
                                                    placeholder="Masukkan kata sandi saat ini"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                disabled={isSendingReset}
                                                className="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 hover:underline mt-1 inline-flex items-center gap-1"
                                            >
                                                {isSendingReset ? (
                                                    <><Loader2 className="w-3 h-3 animate-spin" /> Mengirim...</>
                                                ) : (
                                                    'Lupa kata sandi?'
                                                )}
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kata Sandi Baru</label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="password"
                                                    className="input pl-10"
                                                    placeholder="Minimal 6 karakter"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Konfirmasi Kata Sandi Baru</label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="password"
                                                    className="input pl-10"
                                                    placeholder="Ulangi kata sandi baru"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                            <Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Setelah mengubah kata sandi, email verifikasi akan dikirim ke <strong>{user?.email}</strong> untuk mengonfirmasi perubahan.
                                            </p>
                                        </div>

                                        <button type="submit" disabled={isChangingPassword} className="btn-primary px-6">
                                            {isChangingPassword ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Mengubah...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <KeyRound className="w-4 h-4" />
                                                    Ubah Kata Sandi
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                </div>

                                {/* Danger Zone */}
                                <div className="card p-6 border-red-200 dark:border-red-800/50">
                                    <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-1">Zona Bahaya</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Keluar dari Akun
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* -------- Crop Modal -------- */}
            {showCropModal && imageSrc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowCropModal(false); setImageSrc(null); }} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-primary-900 dark:text-white">Crop Foto Profil</h3>
                            <button
                                onClick={() => { setShowCropModal(false); setImageSrc(null); }}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="relative w-full h-80 bg-gray-900">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                            />
                        </div>
                        <div className="px-6 py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-3">
                                <RotateCw className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <input type="range" min={0} max={360} step={1} value={rotation} onChange={(e) => setRotation(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                <span className="text-xs text-gray-400 w-8 text-right">{rotation}°</span>
                            </div>
                            <p className="text-xs text-gray-400 text-center">Gambar akan dikonversi ke WebP • Maks. 500KB</p>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={() => { setShowCropModal(false); setImageSrc(null); }} className="btn-secondary flex-1">Batal</button>
                            <button onClick={handleCropSave} disabled={isUploadingPhoto} className="btn-primary flex-1">
                                {isUploadingPhoto ? (
                                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Mengupload...</span>
                                ) : 'Simpan Foto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
