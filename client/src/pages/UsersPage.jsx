import { useState, useEffect, useRef } from 'react';
import { userService } from '../services/userService';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import UserFilters from '../components/ui/UserFilters';
import { MoreHorizontal, Ban, ShieldAlert, UserCheck, Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [searchParams] = useSearchParams();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Convert searchParams to object
            const params = Object.fromEntries(searchParams);

            const data = await userService.getUsers({
                page: pagination.page,
                limit: pagination.limit,
                ...params // Spread all filter params: search, status, role, verified, date_from, date_to
            });

            setUsers(data.data.rows);
            setPagination(prev => ({ ...prev, total: data.data.count }));
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, searchParams]); // Refetch when URL params change

    // Actions Handlers
    const handleBan = async (id, username) => {
        if (!confirm(`Are you sure you want to ban @${username} permanently?`)) return;
        try {
            await userService.banUser(id, 'Admin manual action');
            await createAdminNotification(
                'User Banned',
                `User @${username} has been permanently banned by ${currentUser?.username || 'Admin'}.`,
                'warning'
            );
            toast.success(`User @${username} banned`);
            fetchUsers(); // Refresh
        } catch (error) {
            toast.error('Failed to ban user');
        }
    };

    const handleRestore = async (id, username) => {
        if (!confirm(`Restore @${username}?`)) return;
        try {
            await userService.restoreUser(id);
            await createAdminNotification(
                'User Restored',
                `User @${username} has been restored to active status by ${currentUser?.username || 'Admin'}.`,
                'success'
            );
            toast.success(`User @${username} restored`);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to restore user');
        }
    };

    const handleSuspend = async (id, username) => {
        const reason = prompt(`Suspend @${username}?\nEnter reason:`);
        if (!reason) return;
        try {
            await userService.suspendUser(id, 7, reason); // 7 days default
            await createAdminNotification(
                'User Suspended',
                `User @${username} has been suspended for 7 days. Reason: ${reason}`,
                'warning'
            );
            toast.success(`User @${username} suspended`);
            fetchUsers();
            setActiveDropdown(null);
        } catch (error) {
            toast.error('Failed to suspend user');
        }
    };

    const handleBanFromLive = async (id, username) => {
        const hours = prompt(`Ban @${username} from Live?\nEnter duration in hours (leave empty for permanent):`);
        if (hours === null) return; // Cancelled
        try {
            await userService.banFromLive(id, hours || null, 'Admin manual action');
            await createAdminNotification(
                'Live Ban',
                `User @${username} has been banned from going live.`,
                'warning'
            );
            toast.success(`User @${username} banned from live.`);
        } catch (error) {
            toast.error('Failed to ban user from live');
        }
    };

    const isFinancialManager = currentUser?.role_name === 'Financial Manager';
    const isSupportAgent = currentUser?.role_name === 'Support Agent';
    const isMainRoleRestricted = isFinancialManager || isSupportAgent;

    const columns = [
        {
            header: 'User',
            accessor: 'username',
            render: (user) => (
                <div className="flex items-center">
                    <span className="text-xs text-slate-500 mr-2 font-mono">#{user.id}</span>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 mr-3">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            user.username.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{user.username}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (user) => <StatusBadge status={user.status} />
        },
        {
            header: 'Country',
            accessor: 'country_code',
            render: (user) => (
                <span className="text-slate-500 font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                    {user.country || user.country_code || 'N/A'}
                </span>
            )
        },
        {
            header: 'Stats',
            accessor: 'stats',
            render: (user) => (
                <div className="flex flex-col gap-1 text-xs text-slate-500">
                    <span><strong className="text-slate-700">{user.followers_count?.toLocaleString() || 0}</strong> Followers</span>
                    <span><strong className="text-slate-700">{user.videos_count?.toLocaleString() || 0}</strong> Videos</span>
                </div>
            )
        },
        {
            header: 'Joined',
            accessor: 'created_at',
            render: (user) => new Date(user.created_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (user) => (
                <div className="flex items-center gap-2 relative">
                    {!isMainRoleRestricted && (
                        <>
                            {user.status === 'banned' || user.status === 'suspended' ? (
                                <button
                                    onClick={() => handleRestore(user.id, user.username)}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title="Restore User"
                                >
                                    <UserCheck className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleBan(user.id, user.username)}
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                    title="Ban User"
                                >
                                    <Ban className="w-4 h-4" />
                                </button>
                            )}

                            <div className="relative" ref={activeDropdown === user.id ? dropdownRef : null}>
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {activeDropdown === user.id && (
                                    <div className="absolute right-0 top-8 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                        {user.status === 'active' && (
                                            <>
                                                <button
                                                    onClick={() => handleSuspend(user.id, user.username)}
                                                    className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                    Suspend
                                                </button>
                                                <button
                                                    onClick={() => handleBanFromLive(user.id, user.username)}
                                                    className="w-full px-4 py-2 text-left text-sm text-orange-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    Ban from Live
                                                </button>
                                            </>
                                        )}
                                        {(user.status === 'banned' || user.status === 'suspended') && (
                                            <button
                                                onClick={() => handleRestore(user.id, user.username)}
                                                className="w-full px-4 py-2 text-left text-sm text-emerald-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                Restore
                                            </button>
                                        )}
                                        {user.status !== 'banned' && !isMainRoleRestricted && (
                                            <button
                                                onClick={() => handleBan(user.id, user.username)}
                                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                            >
                                                <Ban className="w-4 h-4" />
                                                Ban Permanently
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )
        }
    ];

    const handleExport = () => {
        if (!users.length) {
            toast.error('No users to export');
            return;
        }

        // CSV Header
        const headers = ['ID', 'Username', 'Email', 'Country', 'Status', 'Role', 'Followers', 'Joined'];

        // CSV Rows
        const rows = users.map(user => [
            user.id,
            user.username,
            user.email,
            user.country || 'N/A',
            user.status,
            user.role || 'User',
            user.followers_count || 0,
            new Date(user.created_at).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create Blob and Link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        toast.success(`Exported ${users.length} users`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Users Management</h1>
                    <p className="text-slate-500">View, search, and manage platform users.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <UserFilters
                onFilterChange={() => setPagination(prev => ({ ...prev, page: 1 }))}
                onReset={() => setPagination(prev => ({ ...prev, page: 1 }))}
            />

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
        </div>
    );
}
