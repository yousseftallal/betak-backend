import { useState, useEffect } from 'react';
import StatsCard from '../components/ui/StatsCard';
import { DollarSign, Briefcase, Gift, CreditCard, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../components/ui/AccessDenied';

import toast from 'react-hot-toast';

export default function RevenuePage() {
    const { user } = useAuth();

    // Authorization Check
    const allowedRoles = ['Super Admin', 'Admin', 'Financial Manager'];
    if (user && !allowedRoles.includes(user.role?.name)) {
        return <AccessDenied />;
    }

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        byType: { ads: 0, gift: 0, sponsorship: 0 },
        trend: []
    });

    useEffect(() => {
        const fetchRevenue = async () => {
            setLoading(true);
            try {
                const data = await analyticsService.getRevenueStats();
                setStats({
                    total: data.data.total || 0,
                    byType: data.data.byType || { ads: 0, gift: 0, sponsorship: 0 },
                    trend: data.data.trend || []
                });
            } catch (error) {
                console.error('Failed to fetch revenue stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenue();
    }, []);

    // Helper to format currency
    const formatCurrency = (val) => `$${parseFloat(val).toLocaleString()}`;

    const handleDownload = () => {
        if (loading) return;

        // Prepare CSV Data
        const headers = ['Metric', 'Value'];
        const rows = [
            ['Total Revenue', `$${stats.total}`],
            ['Ad Revenue', `$${stats.byType.ads}`],
            ['Gift Revenue', `$${stats.byType.gift}`],
            ['Sponsorships', `$${stats.byType.sponsorship}`],
        ];

        // Combine
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `revenue_report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Report downloaded successfully');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Revenue & Monetization</h1>
                    <p className="text-slate-400">Financial overview of the platform economy.</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Download Report
                </button>
            </div>

            {/* Financial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue (YTD)"
                    value={formatCurrency(stats.total)}
                    change={0} // To calculate change we need prev period, skipping for MVP
                    icon={DollarSign}
                    color="emerald"
                    loading={loading}
                />
                <StatsCard
                    title="Ad Revenue"
                    value={formatCurrency(stats.byType.ads)}
                    change={0}
                    icon={Briefcase}
                    color="blue"
                    loading={loading}
                />
                <StatsCard
                    title="Gift & Tips"
                    value={formatCurrency(stats.byType.gift)}
                    change={0}
                    icon={Gift}
                    color="purple"
                    loading={loading}
                />
                <StatsCard
                    title="Sponsorships"
                    value={formatCurrency(stats.byType.sponsorship)}
                    change={0}
                    icon={CreditCard}
                    color="orange"
                    loading={loading}
                />
            </div>

            {/* Revenue Split Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                    Revenue Trend (6 Months)
                </h3>
                <div className="w-full">
                    <ResponsiveContainer width="99%" height={450}>
                        {stats.trend.length > 0 ? (
                            <BarChart data={stats.trend} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                                    cursor={{ fill: '#1e293b' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="ads" stackId="a" fill="#3b82f6" name="Ads" />
                                <Bar dataKey="sponsors" stackId="a" fill="#22d3ee" name="Sponsorships" />
                                <Bar dataKey="gifts" stackId="a" fill="#8b5cf6" name="Gifts" />
                            </BarChart>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-500">No revenue data available</div>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
