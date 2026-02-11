import { Metadata } from 'next';
import {
    BookOpen,
    Search,
    User,
    Heart,
    Download,
    Settings,
    ChevronRight,
    LogIn,
    UserPlus,
    Upload,
    BookMarked
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Panduan Penggunaan',
    description: 'Panduan lengkap menggunakan E-Library Politeknik Dewantara',
};

const guides = [
    {
        icon: LogIn,
        title: 'Cara Mendaftar & Login',
        steps: [
            'Klik tombol "Daftar" di pojok kanan atas',
            'Isi formulir pendaftaran dengan data yang valid',
            'Verifikasi email Anda',
            'Login menggunakan email dan password',
        ],
    },
    {
        icon: Search,
        title: 'Mencari Koleksi',
        steps: [
            'Gunakan search bar di halaman utama',
            'Filter hasil berdasarkan kategori (Buku, Jurnal, Modul)',
            'Klik judul untuk melihat detail',
        ],
    },
    {
        icon: BookOpen,
        title: 'Membaca Buku Digital',
        steps: [
            'Buka halaman detail buku',
            'Klik tombol "Baca Sekarang"',
            'Gunakan navigasi untuk berpindah halaman',
            'Gunakan fitur bookmark untuk menandai halaman',
        ],
    },
    {
        icon: Heart,
        title: 'Menyimpan Favorit',
        steps: [
            'Buka halaman detail buku',
            'Klik ikon hati untuk menambahkan ke favorit',
            'Akses favorit dari menu Dashboard',
        ],
    },
    {
        icon: Upload,
        title: 'Upload Laporan Magang',
        steps: [
            'Login ke akun Anda',
            'Buka menu "Upload Laporan" di Dashboard',
            'Isi formulir dengan lengkap',
            'Upload file PDF laporan (maks 10MB)',
            'Tunggu verifikasi dari admin',
        ],
    },
    {
        icon: Download,
        title: 'Download Offline',
        steps: [
            'Buka halaman detail buku (khusus yang tersedia offline)',
            'Klik tombol "Download"',
            'File akan tersimpan di perangkat Anda',
        ],
    },
];

const faqs = [
    {
        question: 'Apakah E-Library gratis?',
        answer: 'Ya, E-Library Politeknik Dewantara gratis untuk seluruh civitas akademika kampus.',
    },
    {
        question: 'Bagaimana cara mendaftar?',
        answer: 'Gunakan email kampus (@polidewa.ac.id) untuk mendaftar, atau hubungi admin perpustakaan.',
    },
    {
        question: 'Bisakah mengakses dari luar kampus?',
        answer: 'Ya, E-Library dapat diakses dari mana saja dengan koneksi internet.',
    },
    {
        question: 'Format file apa yang didukung?',
        answer: 'E-Library mendukung format PDF dan ePub untuk koleksi digital.',
    },
    {
        question: 'Bagaimana jika lupa password?',
        answer: 'Klik "Lupa Password" di halaman login, kemudian ikuti instruksi reset password via email.',
    },
];

export default function PanduanPage() {
    return (
        <div className="min-h-screen pt-24">
            {/* Header */}
            <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/50 dark:to-gray-900 py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="badge-primary mb-4">📚 Bantuan</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                            Panduan Penggunaan
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Pelajari cara menggunakan E-Library dengan mudah
                        </p>
                    </div>
                </div>
            </section>

            {/* Guides */}
            <section className="py-16">
                <div className="container-custom">
                    <h2 className="section-title mb-8">Panduan Langkah demi Langkah</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {guides.map((guide, index) => (
                            <div key={guide.title} className="card p-6 hover:shadow-hover transition-shadow">
                                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
                                    <guide.icon className="w-6 h-6 text-primary-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
                                    {guide.title}
                                </h3>
                                <ol className="space-y-2">
                                    {guide.steps.map((step, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-500 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                                                {i + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 bg-[var(--background-secondary)]">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="section-title text-center mb-8">Pertanyaan Umum (FAQ)</h2>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="card p-6">
                                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">
                                        {faq.question}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="card p-8 text-center max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                            Masih butuh bantuan?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Hubungi tim kami jika Anda memiliki pertanyaan lain
                        </p>
                        <a href="/kontak" className="btn-primary inline-flex">
                            Hubungi Kami
                            <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
