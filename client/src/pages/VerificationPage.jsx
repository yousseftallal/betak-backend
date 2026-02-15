import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Shield, BadgeCheck, FileText, User, RefreshCw, AlertCircle } from 'lucide-react';
import verificationService from '../services/verificationService';
import toast from 'react-hot-toast';

import useDebounce from '../hooks/useDebounce';

const VerificationPage = () => {
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        approvedToday: 0,
        totalVerified: 0
    });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending'); // pending, approved, rejected, all
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useDebounce(searchTerm, 500);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [requestsData, statsData] = await Promise.all([
                verificationService.getRequests(filterStatus === 'all' ? '' : filterStatus),
                verificationService.getStats()
            ]);

            setRequests(requestsData.data || []);
            setStats(statsData.data || { pending: 0, approvedToday: 0, totalVerified: 0 });
        } catch (error) {
            console.error('Failed to fetch verification data', error);
            toast.error('Failed to load verification data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus]);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            await verificationService.updateStatus(id, action);
            // Refresh data or update local state
            setRequests(requests.filter(req => req.id !== id));
            fetchData(); // Refresh stats
            toast.success(`Request ${action} successfully`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    // Filter by search (Frontend side for now, or move to backend if needed)
    const filteredRequests = requests.filter(req =>
        req.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        req.user?.username?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <BadgeCheck className="w-6 h-6 text-blue-500" />
                        Verification Center
                    </h1>
                    <p className="text-sm text-slate-500">Review and manage blue badge requests.</p>
                </div>
                <button onClick={fetchData} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Pending Requests</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Approved Today</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.approvedToday}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Total Verified</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalVerified}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                        <Shield className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2">
                        {['pending', 'approved', 'rejected', 'all'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${filterStatus === status
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading requests...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                        No requests found.
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-100">
                                <th className="px-6 py-4 font-semibold">User Profile</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Document</th>
                                <th className="px-6 py-4 font-semibold">Submitted</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                                                {req.user?.avatar_url ? (
                                                    <img src={req.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    req.user?.username?.substring(0, 2).toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                                    {req.full_name}
                                                    {req.status === 'approved' && <BadgeCheck className="w-3 h-3 text-blue-500" />}
                                                </p>
                                                <p className="text-xs text-slate-500">@{req.user?.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{req.category}</td>
                                    <td className="px-6 py-4 text-sm text-blue-600 hover:underline">
                                        <a href={req.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                            {req.document_type}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${req.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                            req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-orange-50 text-orange-700 border-orange-100'
                                            }`}>
                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'pending' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(req.id, 'approved')}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'rejected')}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        {req.status !== 'pending' && (
                                            <span className="text-xs text-slate-400">
                                                Reviewed by Admin
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default VerificationPage;
