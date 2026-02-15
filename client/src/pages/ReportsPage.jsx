import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { AlertCircle, CheckCircle, Ban, Trash2, Shield, Eye, MessageSquare, ExternalLink, Music } from 'lucide-react';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [filters, setFilters] = useState({ status: 'pending', type: '' });
    const [selectedReport, setSelectedReport] = useState(null); // For split view
    const [actionNote, setActionNote] = useState('');

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await reportService.getReports({
                page: pagination.page,
                limit: pagination.limit,
                status: filters.status,
                type: filters.type
            });
            setReports(data.data.rows);
            setPagination(prev => ({ ...prev, total: data.data.count }));
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [pagination.page, filters]);

    // Action Handlers
    const handleResolve = async (action) => {
        if (!selectedReport) return;
        try {
            await reportService.resolveReport(selectedReport.id, action, actionNote);
            setSelectedReport(null);
            setActionNote('');
            fetchReports(); // Refresh list
            toast.success('Report resolved successfully');
        } catch (error) {
            toast.error('Failed to resolve report');
        }
    };

    const columns = [
        {
            header: 'Reported Content',
            accessor: 'target',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-white flex items-center gap-2">
                        {row.reported_type === 'user' && <Shield className="w-3 h-3 text-blue-400" />}
                        {row.reported_type === 'video' && <Eye className="w-3 h-3 text-purple-400" />}
                        {row.reported_type === 'comment' && <MessageSquare className="w-3 h-3 text-slate-400" />}
                        {row.reported_type === 'sound' && <Music className="w-3 h-3 text-pink-400" />}
                        {row.reported_type.toUpperCase()} #{row.target_id || row.reported_id}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[150px]">{row.reason}</span>
                </div>
            )
        },
        {
            header: 'Reporter',
            accessor: 'reporter',
            render: (row) => <span className="text-slate-400 text-sm">{row.reporter?.username || `User #${row.reporter_user_id}`}</span>
        },
        {
            header: 'Priority',
            accessor: 'priority',
            render: (row) => (
                <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-bold uppercase",
                    row.priority === 'high' ? "text-red-500 bg-red-500/10" :
                        row.priority === 'medium' ? "text-orange-500 bg-orange-500/10" : "text-blue-500 bg-blue-500/10"
                )}>
                    {row.priority || 'medium'}
                </span>
            )
        },
        { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
        {
            header: 'Date',
            accessor: 'created_at',
            render: (row) => new Date(row.created_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (row) => (
                <button
                    onClick={() => setSelectedReport(row)}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    Review
                </button>
            )
        }
    ];

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in duration-500">
            {/* List View */}
            <div className={cn("flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col", selectedReport ? "hidden md:flex md:w-1/2" : "w-full")}>
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-blue-600">All Reports</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <DataTable
                        columns={columns}
                        data={reports}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
                        filterValues={filters}
                        filters={[
                            { key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'resolved', label: 'Resolved' }] },
                            { key: 'type', label: 'Type', options: [{ value: 'video', label: 'Video' }, { value: 'user', label: 'User' }, { value: 'comment', label: 'Comment' }, { value: 'sound', label: 'Sound/Music' }] }
                        ]}
                    />
                </div>
            </div>

            {/* Detail View (Right Panel) */}
            {selectedReport && (
                <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col animate-in slide-in-from-right-10 duration-300">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-500" />
                                Review Report #{selectedReport.id}
                            </h3>
                            <p className="text-xs text-slate-500">Submitted by {selectedReport.reporter?.username} on {new Date(selectedReport.created_at).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => setSelectedReport(null)}
                            className="md:hidden text-slate-400 hover:text-slate-600"
                        >
                            Close
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Reason */}
                        <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Reason Reported</span>
                            <p className="text-slate-900 mt-1 text-sm">{selectedReport.reason}</p>
                            {selectedReport.description && <p className="text-slate-500 text-xs mt-2">"{selectedReport.description}"</p>}
                        </div>

                        {/* Content Preview */}
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-slate-700">Reported Content</span>
                                <a href="#" className="flex items-center text-xs text-blue-600 hover:underline"><ExternalLink className="w-3 h-3 mr-1" /> View Original</a>
                            </div>

                            {/* Mock Content Preview based on Type */}
                            <div className="aspect-video bg-black rounded flex items-center justify-center text-slate-400">
                                {selectedReport.reported_type === 'video' ? <PlayContentPreview /> :
                                    selectedReport.reported_type === 'user' ? <UserContentPreview /> :
                                        <div className="p-4 text-center">Comment content would appear here</div>}
                            </div>
                        </div>

                        {/* Moderation Actions */}
                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="text-sm font-bold text-slate-900 mb-3">Take Action</h4>
                            <textarea
                                className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg p-3 mb-4 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-400"
                                placeholder="Add moderation notes (optional)..."
                                rows="3"
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                            ></textarea>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleResolve('ignore')}
                                    className="flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Ignore & Close
                                </button>
                                <button
                                    onClick={() => handleResolve('delete_content')}
                                    className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Content
                                </button>
                                <button
                                    onClick={() => handleResolve('ban_user')}
                                    className="col-span-2 flex items-center justify-center px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Ban User & Delete Content
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple placeholders
const PlayContentPreview = () => (
    <div className="flex flex-col items-center">
        <Eye className="w-8 h-8 mb-2" />
        <span>Video Preview</span>
    </div>
);

const UserContentPreview = () => (
    <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-700 rounded-full mb-2"></div>
        <span>User Profile</span>
    </div>
);
