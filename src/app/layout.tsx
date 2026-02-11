import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import UserTracker from '@/components/UserTracker'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
    title: {
        default: 'E-Library Politeknik Dewantara',
        template: '%s | E-Library Politeknik Dewantara'
    },
    description: 'Perpustakaan digital Politeknik Dewantara - Akses koleksi buku digital, jurnal, modul, dan laporan magang secara online.',
    keywords: ['e-library', 'perpustakaan digital', 'politeknik dewantara', 'buku digital', 'jurnal', 'modul'],
    authors: [
        { name: 'Fildzah Hashilah N' },
        { name: 'Muhammad Zaky Z N' },
        { name: 'Nurheni' },
        { name: 'Fitriany' },
        { name: 'Hardiani' },
        { name: 'Nurul Hikmah' },
        { name: 'Lusiana' },
        { name: 'Ainin' },
        { name: 'Muliani' },
        { name: 'Sazkia' },
        { name: 'Rafia' },
        { name: 'Yusnia' },
        { name: 'Aulia' },
        { name: 'Nurliana' },
        { name: 'Jesika' },
    ],
    openGraph: {
        title: 'E-Library Politeknik Dewantara',
        description: 'Perpustakaan digital Politeknik Dewantara - Akses koleksi buku digital, jurnal, modul, dan laporan magang secara online.',
        url: 'https://e-library.muhammadzakizn.com',
        siteName: 'E-Library Politeknik Dewantara',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'E-Library Politeknik Dewantara',
        description: 'Perpustakaan digital Politeknik Dewantara',
    },
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: '/logo-poltek.png',
        shortcut: '/logo-poltek.png',
        apple: '/logo-poltek.png',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="id" suppressHydrationWarning>
            <body className={`${inter.variable} ${plusJakarta.variable} font-sans`}>
                <UserTracker />
                <LayoutWrapper>
                    {children}
                </LayoutWrapper>
            </body>
        </html>
    )
}

