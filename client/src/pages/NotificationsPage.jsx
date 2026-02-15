import React, { useState, useEffect } from 'react';
import { Send, Bell, Users, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import notificationService from '../services/notificationService';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_audience: 'all',
        schedule: 'now',
        segment_type: '',
        user_ids: ''
    });

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSegment, setLoadingSegment] = useState(false);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getCampaigns();
            setHistory(response.data || []);
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare data
            const campaignData = { ...formData };
            if (formData.target_audience === 'specific' && formData.user_ids) {
                // Convert comma-separated IDs to array
                campaignData.target_ids = formData.user_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            }
            await notificationService.createCampaign(campaignData);
            toast.success('Notification Scheduled/Sent!');
            setFormData({ title: '', message: '', target_audience: 'all', schedule: 'now', segment_type: '', user_ids: '' });
            fetchHistory(); // Refresh list
        } catch (error) {
            toast.error('Failed to send notification: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSegmentChange = async (e) => {
        const segmentType = e.target.value;
        setFormData({ ...formData, segment_type: segmentType, user_ids: '' });

        if (segmentType && segmentType !== 'manual') {
            try {
                setLoadingSegment(true);
                const response = await userService.getUsersBySegment(segmentType);
                if (response.success && response.data.userIds) {
                    setFormData(prev => ({ ...prev, user_ids: response.data.userIds.join(', ') }));
                }
            } catch (error) {
                toast.error('Failed to load segment: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoadingSegment(false);
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            sent: 'bg-green-50 text-green-700 border-green-100',
            scheduled: 'bg-blue-50 text-blue-700 border-blue-100',
            draft: 'bg-slate-50 text-slate-600 border-slate-100',
            failed: 'bg-red-50 text-red-700 border-red-100'
        };

        const icons = {
            sent: <CheckCircle className="w-3 h-3" />,
            scheduled: <Clock className="w-3 h-3" />,
            failed: <XCircle className="w-3 h-3" />,
            draft: <Clock className="w-3 h-3" />
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-indigo-500" />
                        Push Notifications
                    </h1>
                    <p className="text-sm text-slate-500">Engage users with global or targeted alerts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Compose Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Send className="w-5 h-5 text-indigo-500" /> Compose Message
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="e.g., Happy New Year!"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Type your notification content..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                                <select
                                    value={formData.target_audience}
                                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value, segment_type: '', user_ids: '' })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="all">All Users</option>
                                    <option value="creators">Creators Only</option>
                                    <option value="specific">Specific User IDs</option>
                                </select>
                            </div>
                            {formData.target_audience === 'specific' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Segment</label>
                                        <select
                                            value={formData.segment_type}
                                            onChange={handleSegmentChange}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value="">-- Select Segment --</option>
                                            <option value="manual">Manual Entry</option>
                                            <option value="verification_pending">Pending Verification</option>
                                            <option value="payment_failed">Payment Failed</option>
                                            <option value="payment_success">Payment Success</option>
                                        </select>
                                        {loadingSegment && <p className="text-xs text-blue-600 mt-1">Loading users...</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">User IDs (comma separated)</label>
                                        <textarea
                                            value={formData.user_ids}
                                            onChange={(e) => setFormData({ ...formData, user_ids: e.target.value })}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="e.g., 1, 2, 3"
                                        ></textarea>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Schedule</label>
                                <select
                                    value={formData.schedule}
                                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="now">Send Immediately</option>
                                    <option value="later">Schedule for Later</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" /> {formData.schedule === 'now' ? 'Send Notification' : 'Schedule Notification'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-slate-800">Campaign History</h2>
                            <button onClick={fetchHistory} className="text-sm text-indigo-600 hover:underline">Refresh</button>
                        </div>
                        <div className="overflow-y-auto max-h-[600px]">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Campaign</th>
                                        <th className="px-6 py-3 font-semibold">Target</th>
                                        <th className="px-6 py-3 font-semibold">Date</th>
                                        <th className="px-6 py-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-xs">{item.message}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1 text-sm text-slate-600 capitalize">
                                                    <Users className="w-3 h-3" /> {item.target_audience}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1 text-sm text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(item.sent_at || item.scheduled_for || item.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(item.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!loading && history.length === 0 && (
                                <div className="p-8 text-center text-slate-500">
                                    No notifications sent yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
