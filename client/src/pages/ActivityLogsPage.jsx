import { useState, useEffect } from 'react';
import { activityLogService } from '../services/activityLogService';
import DataTable from '../components/ui/DataTable';
import { ShieldAlert, Clock, User, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../components/ui/AccessDenied';

export default function ActivityLogsPage() {
    const { user } = useAuth();

    // Authorization Check
    const allowedRoles = ['Super Admin', 'Admin', 'Analyst'];
    if (user && !allowedRoles.includes(user.role?.name)) {
        return <AccessDenied />;
    }

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 }); // Higher limit for logs
    const [filters, setFilters] = useState({ action: '', admin: '' });

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const data = await activityLogService.getLogs({
                    page: pagination.page,
                    limit: pagination.limit,
                    action: filters.action
                });
                setLogs(data.data.rows);
                setPagination(prev => ({ ...prev, total: data.data.count }));
            } catch (error) {
                console.error('Failed to fetch activity logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [pagination.page, filters]);

    const columns = [
        {
            header: 'Admin',
            accessor: 'admin',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-600 font-bold border border-slate-200">
                        {log.Admin?.username?.substring(0, 2).toUpperCase() || 'SY'}
                    </div>
                    <span className="font-medium text-slate-900">{log.Admin?.username || 'System'}</span>
                </div>
            )
        },
        {
            header: 'Action',
            accessor: 'action',
            render: (log) => (
                <span className="px-2 py-1 rounded-md text-xs font-mono bg-blue-50 border border-blue-100 text-blue-600 font-medium">
                    {log.action}
                </span>
            )
        },
        {
            header: 'Details',
            accessor: 'details',
            render: (log) => (
                <div className="max-w-md truncate text-slate-600 text-sm" title={JSON.stringify(log.details)}>
                    {log.details ? (
                        typeof log.details === 'object' ?
                            Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ') : log.details
                    ) : '-'}
                </div>
            )
        },
        {
            header: 'Target',
            accessor: 'target_type',
            render: (log) => (
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    {log.target_type} #{log.target_id}
                </span>
            )
        },
        {
            header: 'Time',
            accessor: 'createdAt',
            render: (log) => (
                <div className="flex items-center text-slate-500 text-sm">
                    <Clock className="w-3 h-3 mr-1.5" />
                    {new Date(log.created_at).toLocaleString()}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-blue-600 tracking-tight flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-blue-500" />
                    System Audit Logs
                </h1>
                <p className="text-slate-500">Track all administrative actions for security and compliance.</p>
            </div>

            <DataTable
                columns={columns}
                data={logs}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
        </div>
    );
}
