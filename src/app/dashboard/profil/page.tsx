'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getDepartments } from '@/app/actions/departments';

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

    // Scale down to max 256x256 for profile photos (keeps file small)
    const outputSize = Math.min(256, pixelCrop.width, pixelCrop.height);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const outputCtx = outputCanvas.getContext('2d')!;
    outputCtx.drawImage(canvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, outputSize, outputSize);

    // Convert to WebP with quality adjustment to stay under 500KB
    let quality = 0.8;
    let blob = await canvasToBlob(outputCanvas, 'image/webp', quality);

    // Compress progressively until under 500KB
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

// -------- Component --------

export default function ProfilPage() {
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form data
    const [fullName, setFullName] = useState('');
    const [nim, setNim] = useState('');
    const [prodi, setProdi] = useState('');

    // Photo crop state
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // Custom avatar (not from Google)
    const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        getDepartments().then(setDepartments);
    }, []);

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

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => handleUser(session?.user)
        );

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

        const safetyTimer = setTimeout(() => {
            if (mounted) setIsLoading(false);
        }, 3000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, [router]);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
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

        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const handleCropSave = async () => {
        if (!imageSrc || !croppedAreaPixels || !user) return;

        setIsUploadingPhoto(true);
        setMessage(null);

        try {
            // Crop and convert to WebP
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            const supabase = createClient();

            // Delete old custom avatar if exists
            if (customAvatarUrl) {
                const oldPath = customAvatarUrl.split('/avatars/').pop();
                if (oldPath) {
                    await supabase.storage.from('avatars').remove([oldPath]);
                }
            }

            // Upload new avatar
            const fileName = `${user.id}/${Date.now()}.webp`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, croppedBlob, {
                    contentType: 'image/webp',
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
                    setMessage({ type: 'error', text: 'Storage belum dikonfigurasi. Buat bucket "avatars" di Supabase Dashboard → Storage.' });
                } else if (uploadError.message.includes('security policy') || uploadError.message.includes('row-level')) {
                    setMessage({ type: 'error', text: 'Akses ditolak. Aktifkan RLS policy di bucket "avatars": Supabase → Storage → avatars → Policies → tambahkan policy INSERT dan SELECT untuk authenticated users.' });
                } else {
                    setMessage({ type: 'error', text: `Gagal upload foto: ${uploadError.message}` });
                }
                setIsUploadingPhoto(false);
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    custom_avatar_url: publicUrl,
                    avatar_url: publicUrl,
                },
            });

            if (updateError) {
                setMessage({ type: 'error', text: updateError.message });
            } else {
                setCustomAvatarUrl(publicUrl);
                setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });

                // Refresh user
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

            // Delete from storage
            if (customAvatarUrl) {
                const oldPath = customAvatarUrl.split('/avatars/').pop();
                if (oldPath) {
                    await supabase.storage.from('avatars').remove([oldPath]);
                }
            }

            // Restore Google avatar or remove avatar
            const googleAvatar = user.user_metadata?.picture || null;

            const { error } = await supabase.auth.updateUser({
                data: {
                    custom_avatar_url: null,
                    avatar_url: googleAvatar,
                },
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        const supabase = createClient();

        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                nim: nim,
                program_studi: prodi,
            },
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

    const displayAvatar = customAvatarUrl || user?.user_metadata?.avatar_url || null;
    const isGooglePhoto = !customAvatarUrl && !!user?.user_metadata?.avatar_url;
    const userEmail = user?.email || '';

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
                            Edit Profil
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Perbarui informasi profil Anda
                        </p>
                    </div>
                </div>

                <div className="card p-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            {displayAvatar ? (
                                <img
                                    src={displayAvatar}
                                    alt={fullName}
                                    className="w-28 h-28 rounded-2xl object-cover shadow-lg"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                                    <span className="text-5xl font-bold text-white">
                                        {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                </div>
                            )}

                            {/* Camera overlay */}
                            <label
                                htmlFor="avatar-upload"
                                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>

                        <div className="mt-3 flex flex-col items-center gap-1">
                            {isGooglePhoto && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Foto dari akun Google
                                </p>
                            )}
                            {customAvatarUrl && (
                                <button
                                    onClick={handleRemoveCustomPhoto}
                                    disabled={isUploadingPhoto}
                                    className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Hapus foto kustom
                                </button>
                            )}
                            <button
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1 mt-1 transition-colors"
                            >
                                <Camera className="w-3.5 h-3.5" />
                                {displayAvatar ? 'Ganti foto' : 'Upload foto'}
                            </button>
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

                    {/* Form */}
                    <form onSubmit={handleSave} className="space-y-5">
                        {/* Email (readonly) */}
                        <div>
                            <label className="label">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    className="input pl-12 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                                    value={userEmail}
                                    readOnly
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="label">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="input pl-12"
                                    placeholder="Masukkan nama lengkap"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* NIM */}
                        <div>
                            <label className="label">NIM</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="input pl-12"
                                    placeholder="Masukkan NIM"
                                    value={nim}
                                    onChange={(e) => setNim(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Program Studi */}
                        <div>
                            <label className="label">Program Studi</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    className="input pl-12"
                                    value={prodi}
                                    onChange={(e) => setProdi(e.target.value)}
                                >
                                    <option value="">Pilih program studi</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary w-full"
                        >
                            {isSaving ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Menyimpan...
                                </span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* -------- Crop Modal -------- */}
            {showCropModal && imageSrc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => {
                            setShowCropModal(false);
                            setImageSrc(null);
                        }}
                    />

                    {/* Modal */}
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-primary-900 dark:text-white">
                                Crop Foto Profil
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCropModal(false);
                                    setImageSrc(null);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Crop Area */}
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

                        {/* Controls */}
                        <div className="px-6 py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                            {/* Zoom */}
                            <div className="flex items-center gap-3">
                                <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </div>

                            {/* Rotation */}
                            <div className="flex items-center gap-3">
                                <RotateCw className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <input
                                    type="range"
                                    min={0}
                                    max={360}
                                    step={1}
                                    value={rotation}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <span className="text-xs text-gray-400 w-8 text-right">{rotation}°</span>
                            </div>

                            {/* Info */}
                            <p className="text-xs text-gray-400 text-center">
                                Gambar akan dikonversi ke WebP • Maks. 500KB
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => {
                                    setShowCropModal(false);
                                    setImageSrc(null);
                                }}
                                className="btn-secondary flex-1"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCropSave}
                                disabled={isUploadingPhoto}
                                className="btn-primary flex-1"
                            >
                                {isUploadingPhoto ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Mengupload...
                                    </span>
                                ) : (
                                    'Simpan Foto'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
