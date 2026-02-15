import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Video,
    Flag,
    Activity,
    BarChart3,
    DollarSign,
    Settings,
    Radio,
    Music,
    Shield,
    Wallet,
    LogOut,
    BadgeCheck,
    Bell,
    MessageSquare,
    Globe,
    Megaphone
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { hasAccess } from '../../constants/roles';

// ... (navigation array remains the same)

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Creators', href: '/admin/creators', icon: BarChart3 },
    { name: 'Videos', href: '/admin/videos', icon: Video },
    { name: 'Live Monitor', href: '/admin/live', icon: Radio },
    { name: 'Verification', href: '/admin/verification', icon: BadgeCheck },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Support', href: '/admin/support', icon: MessageSquare },
    { name: 'Music Library', href: '/admin/music', icon: Music },
    { name: 'Reports', href: '/admin/reports', icon: Flag },
    { name: 'Activity Logs', href: '/admin/logs', icon: Activity },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Map Analysis', href: '/admin/geographic', icon: Globe },
    { name: 'Badges', href: '/admin/badges', icon: BadgeCheck },
    { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
    { name: 'Ads & Store', href: '/admin/ads', icon: Megaphone },
    { name: 'Financial', href: '/admin/financial', icon: Wallet },
    { name: 'Admins', href: '/admin/admins', icon: Shield },
    { name: 'Safety Center', href: '/admin/safety', icon: Shield },
    { name: 'Push Campaigns', href: '/admin/campaigns', icon: Megaphone },
    { name: 'System Health', href: '/admin/health', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar({ user, onLogout }) {
    const location = useLocation();

    // Helper to check if link is active (exact or nested)
    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <img
                    src="/logo.png"
                    alt="BeTak"
                    className="h-10 w-auto object-contain mr-2"
                />
                {/* Text Hidden since it's likely in logo, or just keep badge */}
                <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">ADMIN</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>

                {navigation.map((item) => {
                    // Filter based on Role
                    // user.role_name comes from our updated backend
                    const userRole = user?.role_name || user?.role?.name || 'User';
                    if (!hasAccess(item.href, userRole)) return null;

                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                                active
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors", active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center w-full p-2 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-medium text-slate-700 truncate">{user?.username || 'Admin User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
