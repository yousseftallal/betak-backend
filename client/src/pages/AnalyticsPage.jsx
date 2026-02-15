import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Users, Globe } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../components/ui/AccessDenied';

export default function AnalyticsPage() {
    const { user } = useAuth();

    // Authorization Check
    const allowedRoles = ['Super Admin', 'Admin', 'Analyst', 'Content Manager', 'Financial Manager'];
    if (user && !allowedRoles.includes(user.role?.name)) {
        return <AccessDenied />;
    }

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        activityTrend: [],
        peakHours: [],
        demographics: []
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const [peakHours, demographics, dailyStats] = await Promise.all([
                    analyticsService.getPeakHours(),
                    analyticsService.getDemographics(),
                    analyticsService.getDailyStats(14) // Last 14 days
                ]);

                // Transform Daily Stats for Chart
                // DailyStats returns { data: { history: [...] } }
                const activityData = dailyStats.data.history.map(d => ({
                    date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    active: d.active_users || 0
                })).reverse(); // Oldest first

                setData({
                    peakHours: peakHours.data || [],
                    demographics: demographics.data || [],
                    activityTrend: activityData
                });
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
                    Platform Analytics
                </h1>
                <p className="text-slate-400">Deep dive into user behavior and platform trends.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Peak Hours */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-purple-500" />
                        Peak Activity Hours
                    </h3>
                    <div className="w-full">
                        <ResponsiveContainer width="99%" height={300}>
                            {data.peakHours.length > 0 ? (
                                <BarChart data={data.peakHours}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} cursor={{ fill: '#1e293b' }} />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Actions" />
                                </BarChart>
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-500">No data available</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Activity Trend (Formerly Retention) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-emerald-500" />
                        Daily Active Users
                    </h3>
                    <div className="w-full">
                        <ResponsiveContainer width="99%" height={300}>
                            {data.activityTrend.length > 0 ? (
                                <LineChart data={data.activityTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} />
                                    <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Active Users" />
                                </LineChart>
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-500">No activity data yet</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Demographics (Pie) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-cyan-500" />
                        User Demographics
                    </h3>
                    <div className="w-full flex items-center justify-center">
                        <ResponsiveContainer width="99%" height={300}>
                            {data.demographics.length > 0 ? (
                                <PieChart>
                                    <Pie
                                        data={data.demographics}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.demographics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                                        formatter={(value, name, props) => [`${value} Users`, props.payload.name]}
                                    />
                                </PieChart>
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-500">No demographic data</div>
                            )}
                        </ResponsiveContainer>
                        {/* Custom Legend */}
                        {data.demographics.length > 0 && (
                            <div className="ml-8 space-y-2">
                                {data.demographics.map((entry, index) => (
                                    <div key={index} className="flex items-center text-sm text-slate-300">
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        {entry.name}: {entry.value}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
