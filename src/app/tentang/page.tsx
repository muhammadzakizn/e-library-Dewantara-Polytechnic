import { Metadata } from 'next';
import {
    BookOpen,
    Target,
    Eye,
    Users,
    Award,
    Building,
    GraduationCap,
    CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Tentang Kami',
    description: 'Pelajari lebih lanjut tentang E-Library Politeknik Dewantara - visi, misi, dan layanan kami.',
};

const visiMisi = {
    visi: 'Menjadi pusat informasi dan pengetahuan digital terdepan yang mendukung pengembangan akademik dan riset di Politeknik Dewantara.',
    misi: [
        'Menyediakan akses mudah ke koleksi digital berkualitas',
        'Mendukung kegiatan belajar mengajar dengan sumber daya terkini',
        'Memfasilitasi penyimpanan dan penyebaran karya ilmiah',
        'Mengembangkan literasi digital di kalangan civitas akademika',
    ],
};

const features = [
    {
        icon: BookOpen,
        title: 'Koleksi Lengkap',
        description: 'Ribuan koleksi buku digital, jurnal, dan materi pembelajaran',
    },
    {
        icon: GraduationCap,
        title: 'Akses 24/7',
        description: 'Baca kapan saja, di mana saja tanpa batasan waktu',
    },
    {
        icon: Users,
        title: 'Multi-Platform',
        description: 'Akses dari desktop, tablet, atau smartphone',
    },
    {
        icon: Award,
        title: 'Gratis untuk Mahasiswa',
        description: 'Layanan gratis untuk seluruh civitas akademika',
    },
];

const teamMembers = [
    'Fildzah Hashilah N', 'Muhammad Zaky Z N', 'Nurheni', 'Fitriany', 'Hardiani',
    'Nurul Hikmah', 'Lusiana', 'Ainin', 'Muliani', 'Sazkia',
    'Rafia', 'Yusnia', 'Aulia', 'Nurliana', 'Jesika'
];

export default function TentangPage() {
    return (
        <div className="min-h-screen pt-24">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/50 dark:to-gray-900 py-20">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-800 rounded-full text-primary-600 dark:text-primary-300 text-sm mb-6">
                            <Building className="w-4 h-4" />
                            <span>Politeknik Dewantara</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                            Tentang E-Library
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            E-Library Politeknik Dewantara adalah perpustakaan digital yang menyediakan
                            akses ke berbagai koleksi buku, jurnal, modul pembelajaran, dan laporan magang
                            untuk mendukung kegiatan akademik di kampus.
                        </p>
                    </div>
                </div>
            </section>

            {/* Visi & Misi */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Visi */}
                        <div className="card p-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                                <Eye className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">Visi</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {visiMisi.visi}
                            </p>
                        </div>

                        {/* Misi */}
                        <div className="card p-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6">
                                <Target className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">Misi</h2>
                            <ul className="space-y-3">
                                {visiMisi.misi.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-[var(--background-secondary)]">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="section-title">Layanan Kami</h2>
                        <p className="section-subtitle mx-auto">
                            Berbagai layanan yang kami sediakan untuk mendukung kegiatan akademik Anda
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={feature.title} className="card p-6 text-center hover:shadow-hover transition-shadow">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                    <feature.icon className="w-6 h-6 text-primary-500" />
                                </div>
                                <h3 className="font-semibold text-primary-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="section-title">Tim Pengembang</h2>
                        <p className="section-subtitle mx-auto">
                            E-Library ini dikembangkan oleh tim mahasiswa Politeknik Dewantara
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {teamMembers.map((member, index) => (
                            <div
                                key={member}
                                className="card p-4 text-center hover:shadow-hover transition-shadow"
                            >
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                                    {member.charAt(0)}
                                </div>
                                <p className="text-sm font-medium text-primary-900 dark:text-white">
                                    {member}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
