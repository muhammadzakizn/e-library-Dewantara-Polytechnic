'use client';

import { Users, BookOpen, GraduationCap, ClipboardCheck, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface DashboardStats {
    users: number;
    admins: number;
    reports: number;
    pendingReports: number;
}

export default function DashboardHome({ stats }: { stats: DashboardStats }) {
    const statCards = [
        {
            title: 'Total Mahasiswa',
            value: stats.users,
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Laporan Masuk',
            value: stats.reports,
            change: '+5%',
            trend: 'up',
            icon: ClipboardCheck,
            color: 'green'
        },
        {
            title: 'Menunggu Review',
            value: stats.pendingReports,
            change: '-2%',
            trend: 'down',
            icon: Activity,
            color: 'orange'
        },
        {
            title: 'Total Dosen/Admin',
            value: stats.admins,
            change: '0%',
            trend: 'neutral',
            icon: GraduationCap,
            color: 'purple'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'text-green-600 bg-green-50' :
                                        stat.trend === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
                                    }`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700 p-6 rounded-3xl">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Aktivitas Terkini</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">User X mengupload Laporan Magang</p>
                                    <p className="text-xs text-gray-500">2 jam yang lalu</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-3xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">Cuaca Kampus</h3>
                        <div className="text-4xl font-bold mb-4">28°C</div>
                        <p className="opacity-90">Hujan ringan di sekitar Politeknik Dewantara.</p>
                    </div>
                    <CloudRainIcon className="absolute right-4 bottom-4 w-24 h-24 opacity-20" />
                </div>
            </div>
        </div>
    );
}

function CloudRainIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M16 14v6" />
            <path d="M8 14v6" />
            <path d="M12 16v6" />
        </svg>
    );
}
