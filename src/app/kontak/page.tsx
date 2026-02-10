import { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Kontak',
    description: 'Hubungi tim E-Library Politeknik Dewantara',
};

const contactInfo = [
    {
        icon: Mail,
        title: 'Email',
        value: 'admisi@polidewa.ac.id',
        href: 'mailto:admisi@polidewa.ac.id',
    },
    {
        icon: Phone,
        title: 'HP/WA',
        value: '081246888288',
        href: 'tel:+6281246888288',
    },
    {
        icon: MapPin,
        title: 'Alamat',
        value: 'Jl. K.H. Akhmad Razak Lr. 2 No. 7, Kota Palopo, Sulawesi Selatan 91959',
        href: 'https://www.google.com/maps/place/Politeknik+Dewantara/@-3.0138745,120.1921292,15z/data=!3m1!4b1!4m6!3m5!1s0x2d915f272834cded:0xbc5e8da40469943f!8m2!3d-3.013896!4d120.2024075!16s%2Fg%2F11g03mf29v?entry=ttu&g_ep=EgoyMDI2MDIwNC4wIKXMDSoASAFQAw%3D%3D',
    },
    {
        icon: Clock,
        title: 'Jam Operasional',
        value: 'Senin - Jumat, 08:00 - 16:00 WITA',
        href: '#',
    },
];

export default function KontakPage() {
    return (
        <div className="min-h-screen pt-24">
            {/* Header */}
            <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/50 dark:to-gray-900 py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                            Hubungi Kami
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Ada pertanyaan atau saran? Kami siap membantu Anda
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
                                Kirim Pesan
                            </h2>

                            <form className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Masukkan nama Anda"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Email</label>
                                        <input
                                            type="email"
                                            className="input"
                                            placeholder="Masukkan email Anda"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Subjek</label>
                                    <select className="input">
                                        <option value="">Pilih subjek</option>
                                        <option value="bantuan">Bantuan Teknis</option>
                                        <option value="koleksi">Permintaan Koleksi</option>
                                        <option value="saran">Saran & Masukan</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Pesan</label>
                                    <textarea
                                        className="input min-h-[150px] resize-none"
                                        placeholder="Tulis pesan Anda di sini..."
                                    />
                                </div>

                                <button type="submit" className="btn-primary w-full">
                                    <Send className="w-4 h-4" />
                                    Kirim Pesan
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
                                Informasi Kontak
                            </h2>

                            <div className="space-y-4">
                                {contactInfo.map((info) => (
                                    <a
                                        key={info.title}
                                        href={info.href}
                                        className="card p-4 flex items-start gap-4 hover:shadow-hover transition-shadow"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                                            <info.icon className="w-5 h-5 text-primary-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-primary-900 dark:text-white">
                                                {info.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {info.value}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>

                            {/* Google Maps Embed */}
                            <div className="card overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.6584!2d120.1921292!3d-3.0138745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d915f272834cded%3A0xbc5e8da40469943f!2sPoliteknik%20Dewantara!5e0!3m2!1sid!2sid!4v1707566400000!5m2!1sid!2sid"
                                    className="w-full aspect-video border-0"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Lokasi Politeknik Dewantara"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
