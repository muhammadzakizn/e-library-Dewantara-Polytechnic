'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Upload, Loader2, Image as ImageIcon, FileText } from 'lucide-react';

interface UploadCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: 'modul' | 'buku' | 'jurnal';
}

export default function UploadCollectionModal({ isOpen, onClose, onSuccess, type }: UploadCollectionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        judul: '',
        penulis: '', // or dosen for modul
        penerbit: '',
        tahun: new Date().getFullYear().toString(),
        kategori: '', // or jurusan for modul
        deskripsi: '',
        isbn: '', // or issn
        semester: '', // for modul
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [docFile, setDocFile] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const supabase = createClient();

    if (!isOpen) return null;

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (!coverFile || !docFile) {
                throw new Error('Mohon upload cover dan file dokumen.');
            }

            // 1. Upload Cover
            const coverExt = coverFile.name.split('.').pop();
            const coverName = `${type}-${Date.now()}.${coverExt}`;
            const bucketName = type === 'modul' ? 'modul-ajar' : type === 'buku' ? 'buku-digital' : 'jurnal';

            const { data: coverData, error: coverError } = await supabase.storage
                .from(bucketName)
                .upload(`covers/${coverName}`, coverFile);

            if (coverError) throw coverError;

            const { data: { publicUrl: coverUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(`covers/${coverName}`);

            // 2. Upload Document
            const docExt = docFile.name.split('.').pop();
            const docName = `${type}-${Date.now()}.${docExt}`;

            const { data: docData, error: docError } = await supabase.storage
                .from(bucketName)
                .upload(`documents/${docName}`, docFile);

            if (docError) throw docError;

            const { data: { publicUrl: docUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(`documents/${docName}`);

            // 3. Insert into DB
            let table = '';
            let insertData: any = {};

            const { data: { user } } = await supabase.auth.getUser();

            if (type === 'modul') {
                table = 'modul_ajar';
                insertData = {
                    judul: formData.judul,
                    deskripsi: formData.deskripsi,
                    dosen_name: formData.penulis, // mapping
                    dosen_id: user?.id, // Default to uploader if admin/dosen
                    jurusan_id: formData.kategori, // mapping
                    semester: formData.semester,
                    cover_url: coverUrl,
                    file_url: docUrl,
                    status: 'published'
                };
            } else if (type === 'buku') {
                table = 'buku';
                insertData = {
                    judul: formData.judul,
                    penulis: formData.penulis,
                    penerbit: formData.penerbit,
                    tahun_terbit: parseInt(formData.tahun),
                    isbn: formData.isbn,
                    kategori: formData.kategori,
                    deskripsi: formData.deskripsi,
                    cover_url: coverUrl,
                    file_url: docUrl,
                    status: 'published',
                    uploaded_by: user?.id
                };
            } else if (type === 'jurnal') {
                table = 'jurnal';
                insertData = {
                    judul: formData.judul,
                    penulis: formData.penulis,
                    penerbit: formData.penerbit,
                    tahun_terbit: parseInt(formData.tahun),
                    issn: formData.isbn, // mapping
                    kategori: formData.kategori,
                    deskripsi: formData.deskripsi,
                    cover_url: coverUrl,
                    file_url: docUrl,
                    status: 'published',
                    uploaded_by: user?.id
                };
            }

            const { error: dbError } = await supabase.from(table).insert(insertData);
            if (dbError) throw dbError;

            onSuccess();
            onClose();

        } catch (error: any) {
            console.error('Upload failed:', error);
            setErrorMsg(error.message || 'Gagal mengupload file.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        Upload {type === 'modul' ? 'Modul Ajar' : type === 'buku' ? 'Buku Digital' : 'Jurnal'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleUpload} className="p-6 space-y-6">
                    {errorMsg && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                            {errorMsg}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.judul}
                                    onChange={e => setFormData({ ...formData, judul: e.target.value })}
                                    className="input w-full"
                                    placeholder="Judul lengkap..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {type === 'modul' ? 'Nama Dosen' : 'Penulis'}
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.penulis}
                                    onChange={e => setFormData({ ...formData, penulis: e.target.value })}
                                    className="input w-full"
                                    placeholder={type === 'modul' ? 'Nama Dosen Pengampu' : 'Nama Penulis'}
                                />
                            </div>
                            {type !== 'modul' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penerbit</label>
                                    <input
                                        type="text"
                                        value={formData.penerbit}
                                        onChange={e => setFormData({ ...formData, penerbit: e.target.value })}
                                        className="input w-full"
                                        placeholder="Nama Penerbit"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tahun</label>
                                    <input
                                        type="number"
                                        value={formData.tahun}
                                        onChange={e => setFormData({ ...formData, tahun: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {type === 'jurnal' ? 'ISSN' : 'ISBN'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.isbn}
                                        onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                                        className="input w-full"
                                        placeholder={type === 'jurnal' ? 'xxxx-xxxx' : 'ISBN...'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {type === 'modul' ? 'Jurusan/Prodi' : 'Kategori/Genre'}
                                </label>
                                {type === 'modul' ? (
                                    <select
                                        required
                                        value={formData.kategori}
                                        onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="">Pilih Jurusan</option>
                                        <option value="Teknologi Rekayasa Multimedia">Teknologi Rekayasa Multimedia</option>
                                        <option value="Teknologi Rekayasa Pangan">Teknologi Rekayasa Pangan</option>
                                        <option value="Teknologi Rekayasa Metalurgi">Teknologi Rekayasa Metalurgi</option>
                                        <option value="Arsitektur">Arsitektur</option>
                                        <option value="Teknik Sipil">Teknik Sipil</option>
                                        <option value="Teknik Elektronika">Teknik Elektronika</option>
                                        <option value="Teknik Mesin dan Otomotif">Teknik Mesin dan Otomotif</option>
                                    </select>
                                ) : (
                                    <input
                                        required
                                        type="text"
                                        value={formData.kategori}
                                        onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                                        className="input w-full"
                                        placeholder="Contoh: Teknologi, Sains"
                                    />
                                )}
                            </div>
                            {type === 'modul' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                                    <select
                                        required
                                        value={formData.semester}
                                        onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="">Pilih Semester</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <option key={sem} value={`Semester ${sem}`}>Semester {sem}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi/Abstrak</label>
                        <textarea
                            rows={3}
                            value={formData.deskripsi}
                            onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                            className="input w-full"
                            placeholder="Deskripsi singkat..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cover Upload */}
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setCoverFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {coverFile ? (
                                <div className="flex items-center gap-2 justify-center text-green-600">
                                    <ImageIcon className="w-6 h-6" />
                                    <span className="text-sm font-medium truncate max-w-[150px]">{coverFile.name}</span>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm font-medium">Upload Cover</p>
                                    <p className="text-xs">JPG, PNG (Max 2MB)</p>
                                </div>
                            )}
                        </div>

                        {/* Document Upload */}
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={e => setDocFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {docFile ? (
                                <div className="flex items-center gap-2 justify-center text-blue-600">
                                    <FileText className="w-6 h-6" />
                                    <span className="text-sm font-medium truncate max-w-[150px]">{docFile.name}</span>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm font-medium">Upload Dokumen</p>
                                    <p className="text-xs">PDF (Max 10MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Mengupload...' : 'Simpan & Publikasikan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
