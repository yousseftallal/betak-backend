import { useState, useEffect } from 'react';
import { creatorService } from '../services/creatorService';
import StatsCard from '../components/ui/StatsCard';
import DataTable from '../components/ui/DataTable';
import { BarChart3, Users, DollarSign, Clock, Trophy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ComposedChart, Line } from 'recharts';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';

export default function CreatorsPage() {
    const { user } = useAuth();
    const isRestricted = user?.role_name === 'Financial Manager' || user?.role_name === 'Analyst';

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_creators: 0,
        total_revenue: 0,
        active_creators: 0,
        avg_engagement: 0
    });
    const [chartData, setChartData] = useState([]);
    const [topCreators, setTopCreators] = useState([]);

    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [selectedPeriod, setSelectedPeriod] = useState('30d');

    const fetchCreators = async () => {
        setLoading(true);
        try {
            const data = await creatorService.getCreators({ page: pagination.page, limit: pagination.limit });
            setTopCreators(data.data.creators);
            setPagination(prev => ({ ...prev, total: data.data.pagination.total }));

            // Should also fetch stats from backend if available, keeping mock stats for now to avoid breaking UI if backend doesn't support aggregate stats yet
            // setStats(...) 
        } catch (error) {
            console.error('Failed to fetch creators:', error);
            toast.error('Failed to fetch creators');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const data = await creatorService.getAnalytics(selectedPeriod);
            if (data.data && data.data.stats) {
                setStats(data.data.stats);
                setChartData(data.data.chart);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to fetch analytics');
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchCreators(), fetchAnalytics()]).finally(() => setLoading(false));
    }, [pagination.page]);

    useEffect(() => {
        fetchAnalytics();
    }, [selectedPeriod]);

    const handleVerify = async (id, status) => {
        try {
            await creatorService.verifyCreator(id, status);
            fetchCreators(); // Refresh list
            toast.success(`Creator verification updated to: ${status}`);
        } catch (error) {
            console.error(error);
            toast.error('Action failed');
        }
    };

    const columns = [
        {
            header: 'Creator',
            accessor: 'username',
            render: (row) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs mr-3 overflow-hidden">
                        {row.user?.avatar_url ? <img src={row.user.avatar_url} className="w-full h-full object-cover" /> : row.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{row.username}</div>
                        <div className="text-xs text-slate-500">{row.user?.email}</div>
                    </div>
                </div>
            )
        },
        { header: 'Followers', accessor: 'followers_count', render: (row) => row.followers_count?.toLocaleString() || 0 },
        { header: 'Videos', accessor: 'total_videos' },
        {
            header: 'Revenue',
            accessor: 'revenue_earned',
            render: (row) => <span className="text-emerald-400">${Number(row.revenue_earned || 0).toLocaleString()}</span>
        },
        {
            header: 'Engagement',
            accessor: 'engagement_rate',
            render: (row) => (
                <span className="text-slate-700">{row.engagement_rate}%</span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (row) => (
                <div className="flex gap-2">
                    {!isRestricted && (
                        <>
                            {row.user?.is_verified ? (
                                <button
                                    onClick={() => handleVerify(row.id, false)}
                                    className="px-2 py-1 text-xs bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                                >
                                    Revoke
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleVerify(row.id, true)}
                                    className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20"
                                >
                                    Verify
                                </button>
                            )}
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Creators Analytics</h1>
                    <p className="text-slate-500">Insights into creator performance and revenue.</p>
                </div>
                <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                    <button
                        onClick={() => setSelectedPeriod('30d')}
                        className={`px-3 py-1 text-sm font-medium rounded transition-colors ${selectedPeriod === '30d' ? 'text-slate-900 bg-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        30 Days
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('7d')}
                        className={`px-3 py-1 text-sm font-medium rounded transition-colors ${selectedPeriod === '7d' ? 'text-slate-900 bg-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('24h')}
                        className={`px-3 py-1 text-sm font-medium rounded transition-colors ${selectedPeriod === '24h' ? 'text-slate-900 bg-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        24H
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.total_revenue.toLocaleString()}`}
                    change={8.5}
                    icon={DollarSign}
                    color="emerald"
                    loading={loading}
                />
                <StatsCard
                    title="Active Creators"
                    value={stats.active_creators.toLocaleString()}
                    change={12.1}
                    icon={Users}
                    color="blue"
                    loading={loading}
                />
                <StatsCard
                    title="Avg Engagement"
                    value={`${stats.avg_engagement}%`}
                    change={-0.4}
                    icon={BarChart3}
                    color="purple"
                    loading={loading}
                />
                <StatsCard
                    title="Avg Watch Time"
                    value="4m 12s"
                    change={2.3}
                    icon={Clock}
                    color="orange"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue & Creator Growth</h3>
                    <div className="w-full">
                        <ResponsiveContainer width="99%" height={450}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                                <Bar yAxisId="right" dataKey="creators" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Creators" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl flex flex-col">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center">
                            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                            Top Performing Creators
                        </h3>
                        <button className="text-sm text-blue-600 hover:text-blue-500">View All</button>
                    </div>

                    < DataTable
                        columns={columns}
                        data={topCreators}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                    />
                </div>
            </div>
        </div>
    );
}
