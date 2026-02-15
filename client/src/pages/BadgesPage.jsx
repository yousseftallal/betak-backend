import React, { useState, useEffect } from 'react';
import { badgeService } from '../services/badgeService';
import { Award, Plus, UserPlus, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BadgesPage() {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form State
    const [newBadge, setNewBadge] = useState({ name: '', description: '', icon_url: '', criteria: 'manual' });

    const fetchBadges = async () => {
        setLoading(true);
        try {
            const res = await badgeService.getBadges();
            setBadges(res.data || []);
        } catch (error) {
            toast.error('Failed to load badges');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBadges();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await badgeService.createBadge(newBadge);
            toast.success('Badge created!');
            setIsCreateModalOpen(false);
            setNewBadge({ name: '', description: '', icon_url: '', criteria: 'manual' });
            fetchBadges();
        } catch (error) {
            toast.error('Failed to create badge');
        }
    };

    const handleAward = async (badgeId) => {
        const userId = prompt('Enter User ID to award this badge to:');
        if (!userId) return;

        try {
            await badgeService.awardBadge(userId, badgeId, 'Admin Manual Award');
            toast.success('Badge awarded successfully');
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to award badge');
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <Award className="w-6 h-6 text-indigo-500" />
                        Badges & Gamification
                    </h1>
                    <p className="text-sm text-slate-500">Manage achievements and awards.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Create New Badge
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Loading Badges...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map(badge => (
                        <div key={badge.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-2xl">
                                    {/* Placeholder if no icon_url, otherwise img */}
                                    {badge.icon_url ? <img src={badge.icon_url} className="w-8 h-8 object-contain" /> : '🏅'}
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${badge.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {badge.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{badge.name}</h3>
                            <p className="text-sm text-slate-500 mb-4 h-10 overflow-hidden">{badge.description}</p>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => handleAward(badge.id)}
                                    className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" /> Award
                                </button>
                                {/* Future: Edit/Delete */}
                            </div>
                        </div>
                    ))}
                    {badges.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500">No badges created yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Create New Badge</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <Shield className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Badge Name</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={newBadge.name}
                                    onChange={e => setNewBadge({ ...newBadge, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={newBadge.description}
                                    onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Icon URL (Optional)</label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="https://..."
                                    value={newBadge.icon_url}
                                    onChange={e => setNewBadge({ ...newBadge, icon_url: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Badge</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
