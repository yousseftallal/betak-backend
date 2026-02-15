import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import notificationService from '../../services/notificationService';

export default function Header({ onMenuClick }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getAlerts();
            if (response.success) {
                setNotifications(response.data);
                setUnreadCount(response.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for real-time-like updates
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = async () => {
        if (!showDropdown) {
            // Opening dropdown, refresh
            fetchNotifications();
        } else {
            // Closing dropdown, mark as read
            if (unreadCount > 0) {
                await notificationService.markAlertsRead();
                setUnreadCount(0);
            }
        }
        setShowDropdown(!showDropdown);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
            {/* Mobile Menu Trigger & Search */}
            <div className="flex items-center flex-1">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden mr-4 text-slate-500 hover:text-slate-800 focus:outline-none"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users, videos, creators..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
                <button
                    onClick={handleBellClick}
                    className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors focus:outline-none"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
                    )}
                </button>

                {/* Dropdown */}
                {showDropdown && (
                    <div className="absolute top-12 right-0 w-80 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-slate-700">Notifications</h3>
                            <div className="flex gap-2 items-center">
                                {unreadCount > 0 && <span className="text-xs text-blue-600 font-medium">{unreadCount} new</span>}
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        // Optimistic Update
                                        const oldUnread = unreadCount;
                                        setUnreadCount(0);
                                        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

                                        try {
                                            await notificationService.markAlertsRead();
                                        } catch (err) {
                                            console.error('Failed to mark all read', err);
                                            // Revert on error (optional, usually subtle enough to ignore for read status)
                                            // setUnreadCount(oldUnread); 
                                        }
                                    }}
                                    className="text-[10px] text-slate-400 hover:text-blue-600 uppercase font-bold tracking-wider"
                                >
                                    Mark all read
                                </button>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-3 border-b border-slate-50 transition-colors cursor-default ${!notif.is_read ? 'bg-blue-50/30 hover:bg-white' : 'hover:bg-slate-50'}`}
                                        onMouseEnter={() => {
                                            if (!notif.is_read) {
                                                // Optimistic Update
                                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                                                setUnreadCount(prev => Math.max(0, prev - 1));

                                                // Silent API call
                                                notificationService.markOneRead(notif.id).catch(err => console.error(err));
                                            }
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div>
                                                <p className={`text-sm text-slate-800 ${!notif.is_read ? 'font-semibold' : 'font-medium'}`}>{notif.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
