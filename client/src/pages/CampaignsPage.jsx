import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Calendar, Users, Loader, Plus, CheckCircle, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1/admin',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

import AccessDenied from '../components/ui/AccessDenied';
import { useAuth } from '../context/AuthContext';

export default function CampaignsPage() {
    const { user } = useAuth();

    // Authorization Check
    const allowedRoles = ['Super Admin', 'Admin', 'Content Manager'];
    if (user && !allowedRoles.includes(user.role?.name)) {
        return <AccessDenied />;
    }

    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);

    // New Campaign Form State
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_audience: 'all', // all, creators, specific
        schedule: 'now' // now, later
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications/campaigns');
            if (res.data.success) {
                setCampaigns(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            setCreating(true);
            const res = await api.post('/notifications/campaigns', formData);
            if (res.data.success) {
                toast.success(formData.schedule === 'now' ? 'Campaign Sent!' : 'Campaign Scheduled');
                setShowCreate(false);
                setFormData({ title: '', message: '', target_audience: 'all', schedule: 'now' });
                fetchCampaigns();
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create campaign');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Megaphone className="w-8 h-8 text-indigo-600" />
                        Marketing Campaigns
                    </h1>
                    <p className="text-slate-500">Create and manage push notifications to engage your users.</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    {showCreate ? 'Cancel' : <><Plus className="w-4 h-4" /> New Campaign</>}
                </button>
            </div>

            {/* Create Campaign Form */}
            {showCreate && (
                <div className="bg-white rounded-xl border border-indigo-100 shadow-xl p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-indigo-500" /> Draft Campaign
                    </h2>

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Content */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. Ramadan Special Offer!"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Message Body</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                                        placeholder="Enter your message here..."
                                    />
                                </div>
                            </div>

                            {/* Right: Preview & Settings */}
                            <div className="space-y-6">

                                {/* Mobile Preview */}
                                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col items-center">
                                    <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Mobile Preview</p>
                                    <div className="bg-white w-64 rounded-2xl shadow-sm border border-slate-200 p-3 flex gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                                            <span className="text-indigo-600 font-bold text-xs">BT</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-slate-900 truncate">{formData.title || 'Notification Title'}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {formData.message || 'Your message preview will appear here...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                                        <select
                                            value={formData.target_audience}
                                            onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 outline-none bg-white"
                                        >
                                            <option value="all">All Users</option>
                                            <option value="creators">Creators Only</option>
                                            <option value="specific">Test Group (Devs)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Schedule</label>
                                        <select
                                            value={formData.schedule}
                                            onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 outline-none bg-white"
                                        >
                                            <option value="now">Send Now</option>
                                            <option value="later">Schedule for Later</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={creating}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all font-medium"
                            >
                                {creating ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                {formData.schedule === 'now' ? 'Send Campaign' : 'Schedule Campaign'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Campaigns List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Campaign History</h3>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center text-indigo-500">
                        <Loader className="w-8 h-8 animate-spin" />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Smartphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p>No campaigns created yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {campaigns.map((camp) => (
                            <div key={camp.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${camp.status === 'sent' ? 'bg-green-100 text-green-600' :
                                        camp.status === 'scheduled' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {camp.status === 'sent' ? <CheckCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">{camp.title}</h4>
                                        <p className="text-sm text-slate-500 line-clamp-1 max-w-lg">{camp.message}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize">
                                                <Users className="w-3 h-3 inline mr-1" />
                                                {camp.target_audience}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(camp.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${camp.status === 'sent' ? 'bg-green-50 text-green-700 border border-green-100' :
                                        camp.status === 'scheduled' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {camp.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
