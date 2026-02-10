import Link from 'next/link';
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Instagram,
    Youtube,
    Heart,
    Globe
} from 'lucide-react';

const footerLinks = {
    koleksi: [
        { name: 'Buku Digital', href: '/koleksi/buku-digital' },
        { name: 'Jurnal', href: '/koleksi/jurnal' },
        { name: 'Modul & Bahan Ajar', href: '/koleksi/modul' },
        { name: 'Laporan Magang', href: '/koleksi/laporan-magang' },
    ],
    layanan: [
        { name: 'Panduan Penggunaan', href: '/panduan' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Upload Laporan', href: '/dashboard/unggah-laporan' },
        { name: 'Kontak Kami', href: '/kontak' },
    ],
    informasi: [
        { name: 'Tentang Kami', href: '/tentang' },
        { name: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
        { name: 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
    ],
};

const socialLinks = [
    { name: 'Facebook', href: 'https://www.facebook.com/polidewa23/', icon: Facebook },
    { name: 'Instagram', href: 'https://www.instagram.com/politeknikdewantara/', icon: Instagram },
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UCC3mJrYReATs1NtFIRx1gXA', icon: Youtube },
    { name: 'Website', href: 'https://polidewa.ac.id', icon: Globe },
];

const teamMembers = [
    'Fildzah Hashilah N', 'Muhammad Zaky Z N', 'Nurheni', 'Fitriany', 'Hardiani',
    'Nurul Hikmah', 'Lusiana', 'Ainin', 'Muliani', 'Sazkia',
    'Rafia', 'Yusnia', 'Aulia', 'Nurliana', 'Jesika'
];

export default function Footer() {
    return (
        <footer className="bg-primary-900 text-white">
            {/* Main Footer */}
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/logo-poltek.png" alt="Politeknik Dewantara" className="w-14 h-14 object-contain" />
                            <div>
                                <h2 className="text-xl font-bold">E-Library</h2>
                                <p className="text-sm text-gray-400">Politeknik Dewantara</p>
                            </div>
                        </Link>
                        <p className="text-gray-400 leading-relaxed max-w-md">
                            Perpustakaan digital Politeknik Dewantara menyediakan akses mudah ke
                            koleksi buku digital, jurnal ilmiah, modul pembelajaran, dan laporan
                            magang untuk mendukung kegiatan akademik.
                        </p>
                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a
                                href="mailto:admisi@polidewa.ac.id"
                                className="flex items-center gap-3 text-gray-400 hover:text-secondary-400 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                <span>admisi@polidewa.ac.id</span>
                            </a>
                            <a
                                href="tel:+6281246888288"
                                className="flex items-center gap-3 text-gray-400 hover:text-secondary-400 transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                <span>081246888288</span>
                            </a>
                            <a
                                href="https://www.google.com/maps/place/Politeknik+Dewantara/@-3.0138745,120.1921292,15z/data=!3m1!4b1!4m6!3m5!1s0x2d915f272834cded:0xbc5e8da40469943f!8m2!3d-3.013896!4d120.2024075!16s%2Fg%2F11g03mf29v?entry=ttu&g_ep=EgoyMDI2MDIwNC4wIKXMDSoASAFQAw%3D%3D"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 text-gray-400 hover:text-secondary-400 transition-colors"
                            >
                                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Jl. K.H. Akhmad Razak Lr. 2 No. 7,<br />Kota Palopo, Sulawesi Selatan 91959</span>
                            </a>
                        </div>
                    </div>

                    {/* Koleksi Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Koleksi</h3>
                        <ul className="space-y-3">
                            {footerLinks.koleksi.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-secondary-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Layanan Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Layanan</h3>
                        <ul className="space-y-3">
                            {footerLinks.layanan.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-secondary-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Informasi Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Informasi</h3>
                        <ul className="space-y-3">
                            {footerLinks.informasi.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-secondary-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {/* Social Links */}
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Ikuti Kami</h4>
                            <div className="flex gap-3">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        className="w-10 h-10 rounded-lg bg-primary-800 hover:bg-secondary-500 flex items-center justify-center text-gray-400 hover:text-primary-900 transition-all"
                                        aria-label={social.name}
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Members Section */}
            <div className="border-t border-primary-800">
                <div className="container-custom py-6">
                    <p className="text-center text-sm text-gray-500 mb-3">
                        Dikembangkan oleh Tim Mahasiswa Politeknik Dewantara:
                    </p>
                    <p className="text-center text-xs text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        {teamMembers.join(' • ')}
                    </p>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-primary-800 bg-primary-950">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} E-Library Politeknik Dewantara. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            Dibuat dengan <Heart className="w-4 h-4 text-red-500 fill-red-500" /> di Indonesia
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
