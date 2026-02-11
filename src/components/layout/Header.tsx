'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Menu,
    X,
    Search,
    User,
    BookOpen,
    ChevronDown,
    ChevronRight,
    LogIn,
    LogOut,
    Moon,
    Sun,
    LayoutDashboard,
    Settings,
    Link2,
    Shield,
    GraduationCap,
    Lock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const navigation = [
    { name: 'Beranda', href: '/' },
    { name: 'Tentang', href: '/tentang' },
    {
        name: 'Koleksi',
        href: '/koleksi',
        children: [
            { name: 'Buku Digital', href: '/koleksi/buku-digital' },
            { name: 'Jurnal', href: '/koleksi/jurnal' },
            { name: 'Modul & Bahan Ajar', href: '/koleksi/modul' },
            { name: 'Laporan Magang', href: '/koleksi/laporan-magang' },
        ],
    },
    { name: 'Panduan', href: '/panduan' },
    { name: 'Kontak', href: '/kontak' },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showDashboardSub, setShowDashboardSub] = useState(false);
    const [showMobileDashboardSub, setShowMobileDashboardSub] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Check system preference
        if (typeof window !== 'undefined') {
            const isDark = document.documentElement.classList.contains('dark') ||
                (!document.documentElement.classList.contains('light') &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches);
            setIsDarkMode(isDark);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const supabase = createClient();
        let profileName = '';
        let profileAvatar = '';

        const fetchProfile = async (currentUser: SupabaseUser) => {
            let role = 'mahasiswa';
            // Check metadata/email for immediate feedback
            if (currentUser.email === 'admin@polidewa.ac.id') role = 'admin';
            else if (currentUser.user_metadata?.role) role = currentUser.user_metadata.role;

            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, full_name, avatar_url')
                    .eq('id', currentUser.id)
                    .single();
                if (mounted && profile) {
                    if (profile.role) role = profile.role;
                    profileName = profile.full_name || '';
                    profileAvatar = profile.avatar_url || '';
                    // Force re-render by updating user state
                    setUser(prev => prev ? { ...prev, _profileName: profileName, _profileAvatar: profileAvatar } as any : prev);
                }
            } catch { }
            if (mounted) setUserRole(role);
        };

        // Step 1: Instant load from cache
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user);
            }

            // Step 2: Background refresh with fresh data (5s timeout)
            if (session?.user) {
                Promise.race([
                    supabase.auth.getUser(),
                    new Promise((_, reject) => setTimeout(() => reject('timeout'), 5000))
                ]).then((result: any) => {
                    if (mounted && result?.data?.user) {
                        setUser(result.data.user);
                    }
                }).catch(() => { });
            }
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setUserRole(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
        setShowUserMenu(false);
        window.location.href = '/';
    };

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const userName = (user as any)?._profileName || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';
    const userAvatar = user?.user_metadata?.custom_avatar_url || (user as any)?._profileAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
    const dashboardLink = (userRole === 'admin' || userRole === 'dosen') ? '/admin/dashboard' : '/dashboard';

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <div className="container-custom">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-110">
                            <img
                                src="/logo-poltek.png"
                                alt="Politeknik Dewantara"
                                className="w-full h-full object-contain filter drop-shadow-sm"
                            />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-primary-900 dark:text-white leading-tight tracking-tight">
                                E-Library
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                                Politeknik Dewantara
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navigation.map((item) => (
                            <div key={item.name} className="relative group">
                                {item.children ? (
                                    <>
                                        <button
                                            className={`nav-link flex items-center gap-1 ${isActive(item.href) ? 'active' : ''
                                                }`}
                                            onMouseEnter={() => setIsDropdownOpen(true)}
                                            onMouseLeave={() => setIsDropdownOpen(false)}
                                        >
                                            {item.name}
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <div
                                            className={`absolute top-full left-0 pt-2 opacity-0 invisible 
                        group-hover:opacity-100 group-hover:visible transition-all duration-200`}
                                            onMouseEnter={() => setIsDropdownOpen(true)}
                                            onMouseLeave={() => setIsDropdownOpen(false)}
                                        >
                                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 min-w-[200px]">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/50 hover:text-primary-500 transition-colors"
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search Button */}
                        <Link
                            href="/koleksi"
                            className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </Link>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        {/* User State */}
                        {user ? (
                            <div className="relative hidden sm:block">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt={userName}
                                            className="w-8 h-8 rounded-lg object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">
                                                {userName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                                        {userName}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>

                                {showUserMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowUserMenu(false)}
                                        />
                                        <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowDashboardSub(!showDashboardSub)}
                                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        Dashboard
                                                    </span>
                                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showDashboardSub ? 'rotate-90' : ''}`} />
                                                </button>
                                                {showDashboardSub && (
                                                    <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                                                        {(userRole === 'admin' || userRole === 'dosen') ? (
                                                            <Link
                                                                href="/admin/dashboard"
                                                                className="flex items-center gap-3 pl-11 pr-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                                onClick={() => { setShowUserMenu(false); setShowDashboardSub(false); }}
                                                            >
                                                                <Shield className="w-4 h-4 text-blue-500" />
                                                                Dashboard Admin
                                                            </Link>
                                                        ) : (
                                                            <div className="flex items-center gap-3 pl-11 pr-4 py-2 text-sm cursor-not-allowed">
                                                                <Shield className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                                                <div>
                                                                    <span className="text-gray-300 dark:text-gray-600">Dashboard Admin</span>
                                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Khusus admin/dosen</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {(userRole !== 'admin' && userRole !== 'dosen') ? (
                                                            <Link
                                                                href="/dashboard"
                                                                className="flex items-center gap-3 pl-11 pr-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                                onClick={() => { setShowUserMenu(false); setShowDashboardSub(false); }}
                                                            >
                                                                <GraduationCap className="w-4 h-4 text-green-500" />
                                                                Dashboard Mahasiswa
                                                            </Link>
                                                        ) : (
                                                            <div className="flex items-center gap-3 pl-11 pr-4 py-2 text-sm cursor-not-allowed">
                                                                <GraduationCap className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                                                <div>
                                                                    <span className="text-gray-300 dark:text-gray-600">Dashboard Mahasiswa</span>
                                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Khusus mahasiswa</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {(userRole === 'admin' || userRole === 'dosen') ? (
                                                <div className="flex items-start gap-3 px-4 py-2.5 text-sm cursor-not-allowed">
                                                    <Settings className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5" />
                                                    <div>
                                                        <span className="text-gray-300 dark:text-gray-600">Pengaturan</span>
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Khusus akun mahasiswa</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Link
                                                    href="/dashboard/pengaturan"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Pengaturan
                                                </Link>
                                            )}
                                            <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Keluar
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden sm:flex items-center gap-2 btn-primary text-sm px-4 py-2.5"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Masuk</span>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div >

            {/* Mobile Menu */}
            < div
                className={`lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`
                }
            >
                <nav className="container-custom py-4 space-y-1">
                    {navigation.map((item) => (
                        <div key={item.name}>
                            {item.children ? (
                                <div className="space-y-1">
                                    <div className="px-4 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                        {item.name}
                                    </div>
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.name}
                                            href={child.href}
                                            className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/50 hover:text-primary-500 rounded-lg transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`block px-4 py-2.5 rounded-lg transition-colors ${isActive(item.href)
                                        ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-500'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            )}
                        </div>
                    ))}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        {user ? (
                            <div className="space-y-1">
                                <div>
                                    <button
                                        onClick={() => setShowMobileDashboardSub(!showMobileDashboardSub)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <span className="flex items-center gap-3">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Dashboard
                                        </span>
                                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showMobileDashboardSub ? 'rotate-90' : ''}`} />
                                    </button>
                                    {showMobileDashboardSub && (
                                        <div className="ml-7 mt-1 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                                            {(userRole === 'admin' || userRole === 'dosen') ? (
                                                <Link
                                                    href="/admin/dashboard"
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <Shield className="w-4 h-4 text-blue-500" />
                                                    Dashboard Admin
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-3 px-3 py-2 text-sm cursor-not-allowed">
                                                    <Shield className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                                    <div>
                                                        <span className="text-gray-300 dark:text-gray-600">Dashboard Admin</span>
                                                        <p className="text-[10px] text-gray-400">Khusus admin/dosen</p>
                                                    </div>
                                                </div>
                                            )}
                                            {(userRole !== 'admin' && userRole !== 'dosen') ? (
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <GraduationCap className="w-4 h-4 text-green-500" />
                                                    Dashboard Mahasiswa
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-3 px-3 py-2 text-sm cursor-not-allowed">
                                                    <GraduationCap className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                                    <div>
                                                        <span className="text-gray-300 dark:text-gray-600">Dashboard Mahasiswa</span>
                                                        <p className="text-[10px] text-gray-400">Khusus mahasiswa</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {(userRole === 'admin' || userRole === 'dosen') ? (
                                    <div className="flex items-start gap-3 px-4 py-2.5 cursor-not-allowed">
                                        <Settings className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5" />
                                        <div>
                                            <span className="text-gray-300 dark:text-gray-600">Pengaturan</span>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Khusus akun mahasiswa</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href="/dashboard/pengaturan"
                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Pengaturan
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Keluar
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 btn-primary w-full"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Masuk</span>
                            </Link>
                        )}
                    </div>
                </nav>
            </div >
        </header >
    );
}
