import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, AlertCircle, CheckCircle, Clock, User, X, Send, PlayCircle, XCircle, CheckCircle2 } from 'lucide-react';
import supportService from '../services/supportService';
import toast from 'react-hot-toast';

const SupportPage = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ open: 0, inProgress: 0, closed: 0, highPriority: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    // Modal State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketsData, statsData] = await Promise.all([
                supportService.getTickets({ status: filter, search }),
                supportService.getStats()
            ]);

            setTickets(ticketsData.data || []);
            setStats(statsData.data || { open: 0, inProgress: 0, closed: 0, highPriority: 0 });
        } catch (error) {
            console.error('Failed to fetch support data', error);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchData, 300); // Debounce search
        return () => clearTimeout(timeout);
    }, [filter, search]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await supportService.updateTicket(id, { status });
            // Refresh local state without full reload
            setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
            if (selectedTicket && selectedTicket.id === id) {
                setSelectedTicket({ ...selectedTicket, status });
            }
            toast.success('Ticket status updated');
        } catch (error) {
            toast.error('Failed to update ticket');
        }
    };

    const handleResolveAppeal = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this appeal?`)) return;
        try {
            await supportService.resolveAppeal(id, action, responseMessage);
            // Re-fetch to see updated status
            fetchData();
            setSelectedTicket(null);
            toast.success(`Appeal ${action}d successfully`);
        } catch (error) {
            toast.error('Failed to resolve appeal');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-red-50 text-red-600 border-red-100';
            case 'in-progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'closed': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'resolved': return 'bg-green-50 text-green-600 border-green-100';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 font-bold';
            case 'medium': return 'text-orange-500 font-medium';
            case 'low': return 'text-green-600 font-medium';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-purple-500" />
                        Support Tickets
                    </h1>
                    <p className="text-sm text-slate-500">Manage user inquiries, appeals, and reports.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-medium">Open Tickets</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.open}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-medium">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-medium">High Priority</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.highPriority}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-medium">Closed</p>
                    <p className="text-2xl font-bold text-slate-500 mt-1">{stats.closed}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${filter === 'all'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            All
                        </button>
                        <button
                            onClick={() => setFilter('open')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${filter === 'open'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <AlertCircle className="w-4 h-4" />
                            Open
                            {stats.open > 0 && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{stats.open}</span>}
                        </button>
                        <button
                            onClick={() => setFilter('in-progress')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${filter === 'in-progress'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <PlayCircle className="w-4 h-4" />
                            In Progress
                            {stats.inProgress > 0 && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{stats.inProgress}</span>}
                        </button>
                        <button
                            onClick={() => setFilter('resolved')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${filter === 'resolved'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Resolved
                        </button>
                        <button
                            onClick={() => setFilter('closed')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${filter === 'closed'
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <XCircle className="w-4 h-4" />
                            Closed
                        </button>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Ticket ID/Subject</th>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Priority</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Created</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        No tickets found.
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-900">#{ticket.id}</p>
                                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{ticket.subject}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 overflow-hidden">
                                                    {ticket.user?.avatar_url ? (
                                                        <img src={ticket.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        ticket.user?.username?.substring(0, 1).toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <span className="text-sm text-slate-600">@{ticket.user?.username || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{ticket.category}</td>
                                        <td className={`px-6 py-4 text-sm ${getPriorityColor(ticket.priority)} capitalize`}>{ticket.priority}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)} capitalize`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    Ticket #{selectedTicket.id}
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedTicket.status)} capitalize`}>
                                        {selectedTicket.status}
                                    </span>
                                </h3>
                                <p className="text-sm text-slate-500">{selectedTicket.subject}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* User Info */}
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                                    {selectedTicket.user?.avatar_url ? (
                                        <img src={selectedTicket.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        selectedTicket.user?.username?.substring(0, 1).toUpperCase() || 'U'
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{selectedTicket.user?.username}</p>
                                    <p className="text-xs text-slate-500">{selectedTicket.user?.email}</p>
                                </div>
                                <div className="ml-auto flex gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {new Date(selectedTicket.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{selectedTicket.message}</p>
                            </div>

                            {/* Actions / Reply (Mock for now) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Internal Notes / Reply</label>
                                <textarea
                                    className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    rows="3"
                                    placeholder="Add notes..."
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                ></textarea>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex gap-2 flex-wrap">
                                        {/* Appeal Actions */}
                                        {selectedTicket.category === 'Appeal' && selectedTicket.status !== 'closed' && (
                                            <>
                                                <button
                                                    onClick={() => handleResolveAppeal(selectedTicket.id, 'approve')}
                                                    className="px-3 py-1.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5"
                                                    title="Unban user"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Accept Appeal
                                                </button>
                                                <button
                                                    onClick={() => handleResolveAppeal(selectedTicket.id, 'reject')}
                                                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject Appeal
                                                </button>
                                            </>
                                        )}

                                        {selectedTicket.status !== 'open' && selectedTicket.status !== 'closed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket.id, 'open')}
                                                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                Reopen
                                            </button>
                                        )}
                                        {selectedTicket.status !== 'in-progress' && selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket.id, 'in-progress')}
                                                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                                In Progress
                                            </button>
                                        )}
                                        {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                                                className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Resolve
                                            </button>
                                        )}
                                        {selectedTicket.status !== 'closed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                                                className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Close
                                            </button>
                                        )}
                                    </div>
                                    <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 flex items-center gap-2">
                                        <Send className="w-4 h-4" /> Save Note
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default SupportPage;
