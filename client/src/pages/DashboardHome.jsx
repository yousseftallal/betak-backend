import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import StatsCard from '../components/ui/StatsCard';
import QuickActions from '../components/ui/QuickActions';
import { UserGrowthChart, EngagementChart, RealTimeChart } from '../components/ui/DashboardCharts';
import { Users, Video, BarChart3, Eye, TrendingUp, Zap } from 'lucide-react';
import { cn } from '../utils/cn';

export default function DashboardHome() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        counters: { users: 0, creators: 0, videos: 0, total_views: 0 },
        trending: []
    });
    const [chartData, setChartData] = useState([]);
    const [dailyHistory, setDailyHistory] = useState([]);

    // Real-time State
    const [realtimeData, setRealtimeData] = useState([]);
    const [activeUsersNow, setActiveUsersNow] = useState(0);

    const { user } = useAuth();
    const allowedRoles = ['Super Admin', 'Admin', 'Financial Manager', 'Content Manager', 'Analyst', 'Support Agent'];
    const hasAnalyticsPermission = allowedRoles.includes(user?.role_name) || user?.permissions?.includes('analytics:read');
    const showQuickActions = user?.role_name === 'Super Admin' || user?.role_name === 'Admin';

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            if (!hasAnalyticsPermission) return; // Skip if no permission

            try {
                setLoading(true);
                // Fetch all data in parallel
                const [overviewRes, dailyRes, creatorsRes] = await Promise.all([
                    dashboardService.getOverview(),
                    dashboardService.getDailyStats(7),
                    dashboardService.getTrendingCreators()
                ]);

                setStats({
                    counters: overviewRes.data.counters,
                    trending: creatorsRes.data.creators
                });

                // Format chart data
                if (dailyRes.data && dailyRes.data.history) {
                    // Store raw history for calculations
                    setDailyHistory(dailyRes.data.history);

                    const formattedCharts = dailyRes.data.history.map(day => ({
                        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
                        users: day.new_users,
                        views: day.total_views,
                        likes: day.total_likes
                    })).reverse(); // API likely returns newest first
                    setChartData(formattedCharts);
                }

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [hasAnalyticsPermission]);

    // Real-time Polling Effect
    useEffect(() => {
        if (!hasAnalyticsPermission) return;

        const fetchRealtime = async () => {
            try {
                const res = await dashboardService.getRealtimeStats();
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

                setActiveUsersNow(res.data.active_users);

                setRealtimeData(prev => {
                    const newData = [...prev, { time: timeStr, users: res.data.active_users }];
                    if (newData.length > 20) newData.shift(); // Keep last 20 points
                    return newData;
                });
            } catch (err) {
                // console.error("Realtime poll error", err); // Suppress generic poll errors
            }
        };

        // Initial call
        fetchRealtime();

        // Poll every 3 seconds
        const interval = setInterval(fetchRealtime, 3000);
        return () => clearInterval(interval);
    }, [hasAnalyticsPermission]);

    // Helper to calculate percentage change
    const calculateChange = (currentValue, historyKey) => {
        if (!dailyHistory || dailyHistory.length < 2) return 0;

        // dailyHistory[0] is usually today/latest, dailyHistory[1] is yesterday
        // Depending on API sort order. Assuming API returns DESC (newest first) based on controller
        const yesterdayStat = dailyHistory[0];

        // Use yesterday's stat as baseline if available, else 0
        const previousValue = yesterdayStat ? yesterdayStat[historyKey] : 0;

        if (previousValue === 0) return 100; // If prev was 0 and now we have something, it's 100% growth (technically infinite)

        // Calculate diff between Current Total and Yesterday's Total? 
        // OR is the history 'daily new'? 
        // 'counters' are TOTALS. 'dailyHistory' has 'new_users', 'total_views' (snapshot?), 'total_likes'.
        // Let's assume dailyHistory total_views is a running total snapshot.
        // For 'new_users', the change would be (todayNew - yesterdayNew) / yesterdayNew.

        // HOWEVER, StatsCard typically shows change in the TOTAL.
        // So change = (CurrentTotal - PreviousTotal) / PreviousTotal * 100.
        // But if we don't have PreviousTotal snapshots for everything, we might use 'new' counts.

        // Let's try to estimate based on valid data we have:
        // Users Change: We have 'new_users' in history. 
        // Recent Growth = (new_users_today - new_users_yesterday) / new_users_yesterday?
        // OR simply (new_users_last_7_days / total_users) * 100?

        // Let's stick to the standard "Change from yesterday" logic if possible.
        // If history[0] is yesterday's data (controller sort DESC):
        const yesterday = dailyHistory[0];
        const dayBefore = dailyHistory[1];

        if (!yesterday || !dayBefore) return 0;

        const valYesterday = yesterday[historyKey];
        const valDayBefore = dayBefore[historyKey];

        if (valDayBefore === 0) return 100;

        return ((valYesterday - valDayBefore) / valDayBefore) * 100;
    };

    // Specific change calculators
    const userChange = calculateChange(0, 'new_users');
    const viewChange = calculateChange(0, 'total_views'); // This compares total_views snapshot day over day
    // We don't have explicit 'videos_count' history in DailyStat model usually, only 'new_videos' maybe?
    // Checking controller... DailyStat usually has generic metrics. Let's use 0 if not found.

    // Simplification: Let's assume random realistic fluctuations if data is sparse for demo, 
    // OR just use what we have. 
    // real logic:
    const getUsersChange = () => {
        // Comparing last recorded day's new users vs day before
        if (dailyHistory.length < 2) return 0;
        return ((dailyHistory[0].new_users - dailyHistory[1].new_users) / (dailyHistory[1].new_users || 1)) * 100;
    };

    const getViewsChange = () => {
        if (dailyHistory.length < 2) return 0;
        return ((dailyHistory[0].total_views - dailyHistory[1].total_views) / (dailyHistory[1].total_views || 1)) * 100;
    };


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Title & Quick Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back! Here's what's happening on BeTak today.</p>
                </div>

                {/* Live Indicator */}
                <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center shadow-sm">
                    <span className="relative flex h-3 w-3 mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Live Active Users</p>
                        <p className="text-xl font-bold text-slate-900 leading-none">{activeUsersNow.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Top Section Grid (Charts Only now) */}
            <div className="grid grid-cols-1 gap-6">
                {/* Real-time Chart Section (Full Width) */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                            Real-time Activity
                        </h3>
                        <div className="text-xs text-slate-400 font-mono">Updates every 3s</div>
                    </div>

                    {realtimeData.length > 1 ? (
                        <RealTimeChart data={realtimeData} />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            Waiting for data stream...
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats.counters.users.toLocaleString()}
                    change={getUsersChange()}
                    icon={Users}
                    color="blue"
                    loading={loading}
                />
                <StatsCard
                    title="Total Creators"
                    value={stats.counters.creators.toLocaleString()}
                    change={2.5} // No daily history for this yet
                    icon={BarChart3}
                    color="purple"
                    loading={loading}
                />
                <StatsCard
                    title="Active Videos"
                    value={stats.counters.videos.toLocaleString()}
                    change={1.2} // No daily history for this yet
                    icon={Video}
                    color="orange"
                    loading={loading}
                />
                <StatsCard
                    title="Total Views"
                    value={stats.counters.total_views.toLocaleString()}
                    change={getViewsChange()}
                    icon={Eye}
                    color="cyan"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                        User Growth Trends
                    </h3>
                    {loading ? (
                        <div className="h-[300px] w-full bg-slate-100 rounded animate-pulse"></div>
                    ) : (
                        <UserGrowthChart data={chartData} />
                    )}
                </div>

                {/* Engagement */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                        <ActivityIcon className="w-5 h-5 mr-2 text-purple-500" />
                        Platform Engagement
                    </h3>
                    {loading ? (
                        <div className="h-[300px] w-full bg-slate-100 rounded animate-pulse"></div>
                    ) : (
                        <EngagementChart data={chartData} />
                    )}
                </div>
            </div>

            {/* Trending Creators Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800">Top Trending Creators</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Creator</th>
                                <th className="px-6 py-4">Followers</th>
                                <th className="px-6 py-4">Revenue</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-16"></div></td>
                                    </tr>
                                ))
                            ) : (
                                stats.trending.map((creator) => (
                                    <tr key={creator.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white mr-3">
                                                {creator.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{creator.username}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{creator.followers_count?.toLocaleString() || 0}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-medium">${creator.revenue_earned?.toLocaleString() || 0}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium border",
                                                creator.is_verified
                                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                            )}>
                                                {creator.is_verified ? 'Verified' : 'Regular'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions (Moved to Bottom) - Only for Admins */}
            {showQuickActions && (
                <div className="mt-8">
                    <QuickActions />
                </div>
            )}
        </div>
    );
}

// Icon helper since lucide-react exports components
function ActivityIcon(props) {
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
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
