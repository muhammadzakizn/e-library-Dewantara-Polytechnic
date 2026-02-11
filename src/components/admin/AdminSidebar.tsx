'use client';

import { useState } from 'react';
import {
    LayoutDashboard, Users, BookOpen, Settings,
    ChevronRight, LogOut, Pin, PinOff, Shield,
    GraduationCap, ClipboardCheck, Library, GripVertical
} from 'lucide-react';
import Image from 'next/image';

export type AdminSection = 'beranda' | 'pengguna' | 'pustaka' | 'pengaturan';

interface AdminSidebarProps {
    activeSection: AdminSection;
    setActiveSection: (section: AdminSection) => void;
    onLogout: () => void;
    currentProfile: any;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({
    activeSection,
    setActiveSection,
    onLogout,
    currentProfile,
    isSidebarOpen,
    setIsSidebarOpen
}: AdminSidebarProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Combined state: Sidebar is expanded if pinned (isOpen) OR hovered
    const isExpanded = isSidebarOpen || isHovered;

    const sidebarItems = [
        { key: 'beranda', label: 'Beranda', icon: LayoutDashboard },
        { key: 'pengguna', label: 'Kelola Pengguna', icon: Users },
        { key: 'pustaka', label: 'Kelola Pustaka', icon: Library },
        { key: 'pengaturan', label: 'Pengaturan Sistem', icon: Settings },
    ];

    return (
        <aside
            className={`fixed inset-y-4 left-4 z-50 flex flex-col transition-all duration-300 ease-in-out
                ${isExpanded ? 'w-64' : 'w-20'}
                bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800
                shadow-2xl rounded-3xl overflow-hidden`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header / Logo */}
            <div className={`h-20 flex items-center px-6 border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                <div className={`flex items-center gap-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                    <div className="w-10 h-10 relative flex-shrink-0">
                        <Image
                            src="/logo-poltek.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 dark:text-white text-sm leading-tight whitespace-nowrap">Admin Panel</h1>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">Politeknik Dewantara</p>
                    </div>
                </div>

                {!isExpanded && (
                    <div className="w-12 h-12 flex items-center justify-center transition-all duration-300">
                        <Image
                            src="/logo-poltek.png"
                            alt="Logo"
                            width={48}
                            height={48}
                            className="object-contain drop-shadow-md"
                        />
                    </div>
                )}

                {isExpanded && (
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-1.5 rounded-lg transition-colors ${isSidebarOpen ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        {isSidebarOpen ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
                {sidebarItems.map((item) => {
                    const isActive = activeSection === item.key;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key as AdminSection)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'
                                }`}
                        >
                            <div className={`flex items-center justify-center w-8 h-8 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-14'}`}>
                                {item.label}
                            </span>

                            {isActive && isExpanded && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
                <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 transition-all duration-300 ${isExpanded ? '' : 'items-center justify-center flex'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                            {currentProfile?.full_name?.[0] || 'A'}
                        </div>

                        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentProfile?.full_name || 'Admin'}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{currentProfile?.role}</p>
                        </div>
                    </div>

                    {isExpanded && (
                        <button
                            onClick={onLogout}
                            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Keluar
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
