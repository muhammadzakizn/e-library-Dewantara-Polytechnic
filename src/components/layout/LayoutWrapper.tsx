'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const noLayoutRoutes = ['/login', '/daftar', '/lupa-password', '/admin'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isNoLayout = noLayoutRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    const isAdmin = pathname.startsWith('/admin');

    if (isNoLayout) {
        return <>{children}</>;
    }

    // Admin pages: show Header only (no Footer), with proper spacing
    if (isAdmin) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
