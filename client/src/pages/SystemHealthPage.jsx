import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Clock, Zap, Cpu, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1/admin',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function SystemHealthPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [memoryHistory, setMemoryHistory] = useState([]);

    useEffect(() => {
        fetchHealth();

        // Poll every 5 seconds
        const interval = setInterval(() => {
            setRefreshKey(prev => prev + 1);
        }, 5000);

        return () => clearInterval(interval);
    }, [refreshKey]);

    const fetchHealth = async () => {
        try {
            const res = await api.get('/health');
            if (res.data.success) {
                const stats = res.data.data;
                setData(stats);

                // Update history graph
                setMemoryHistory(prev => {
                    const newPoint = {
                        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        usage: stats.system.memory.used_mb
                    };
                    const newHistory = [...prev, newPoint];
                    if (newHistory.length > 20) newHistory.shift(); // Keep last 20 points
                    return newHistory;
                });
            }
        } catch (error) {
            console.error(error);
            // toast.error('Connection lost'); // Optional: noisy if polling
        } finally {
            setLoading(false);
        }
    };

    const formatUptime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    };

    if (loading && !data) return <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-8 h-8 text-emerald-600" />
                        System Health
                    </h1>
                    <p className="text-slate-500">Live server performance and infrastructure status.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Live Updating (5s)
                </div>
            </div>

            {!data ? (
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center text-red-700">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-500" />
                    <p className="font-semibold">Unable to reach server health endpoint.</p>
                </div>
            ) : (
                <>
                    {/* Top Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <StatusCard
                            label="Overall Status"
                            value={data.status === 'healthy' ? 'Operational' : 'Degraded'}
                            icon={Activity}
                            color={data.status === 'healthy' ? 'emerald' : 'amber'}
                            subtext="All systems nominal"
                        />

                        <StatusCard
                            label="Server Uptime"
                            value={formatUptime(data.system.uptime_seconds)}
                            icon={Clock}
                            color="blue"
                            subtext="Since last restart"
                        />

                        <StatusCard
                            label="Database"
                            value={data.services.database.status === 'healthy' ? 'Connected' : 'Error'}
                            icon={Database}
                            color={data.services.database.status === 'healthy' ? 'emerald' : 'red'}
                            subtext={`${data.services.database.latency_ms}ms latency`}
                        />

                        <StatusCard
                            label="Server Load"
                            value={`${data.system.memory.os_usage_percent}%`}
                            icon={Cpu}
                            color={data.system.memory.os_usage_percent > 80 ? 'amber' : 'purple'}
                            subtext="Memory Usage"
                        />
                    </div>

                    {/* Main Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Memory Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-w-0">
                            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Memory Usage History (Heap MB)
                            </h3>
                            <div className="h-[300px] w-full min-w-0">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={memoryHistory}>
                                        <defs>
                                            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="time" hide />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            labelStyle={{ color: '#64748B' }}
                                        />
                                        <Area type="monotone" dataKey="usage" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Service Details */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Server className="w-5 h-5 text-slate-500" />
                                Infrastructure Details
                            </h3>

                            <div className="space-y-4">
                                <ServiceRow
                                    name="PostgreSQL Database"
                                    status={data.services.database.status === 'healthy'}
                                    detail={`PG Dialect • ${data.services.database.latency_ms}ms`}
                                />

                                <ServiceRow
                                    name="Redis Cache"
                                    status={false} // Hardcoded for now as per controller placeholder
                                    detail="Not Configured"
                                />

                                <ServiceRow
                                    name="API Gateway"
                                    status={true}
                                    detail="Express.js Server"
                                />

                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-slate-500">RSS Memory</span>
                                        <span className="font-mono font-medium">{data.system.memory.rss_mb} MB</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-slate-500">Heap Total</span>
                                        <span className="font-mono font-medium">{data.system.memory.total_mb} MB</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Heap Used</span>
                                        <span className="font-mono font-medium">{data.system.memory.used_mb} MB</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

function StatusCard({ label, value, icon: Icon, color, subtext }) {
    const colorClasses = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        red: 'bg-red-50 text-red-600 border-red-100',
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                    <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
                </div>
                <div className={`p-2 rounded-lg border ${colorClasses[color] || colorClasses.blue}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
    );
}

function ServiceRow({ name, status, detail }) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <div>
                    <p className="text-sm font-medium text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{detail}</p>
                </div>
            </div>
            {status ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
                <AlertTriangle className="w-4 h-4 text-slate-400" />
            )}
        </div>
    );
}
