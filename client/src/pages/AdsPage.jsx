import React, { useState, useEffect } from 'react';
import { adService } from '../services/adService';
import { Megaphone, Plus, Trash2, Edit2, Link as LinkIcon, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../components/ui/AccessDenied';

export default function AdsPage() {
    const { user } = useAuth();

    // Authorization Check
    const allowedRoles = ['Super Admin', 'Admin', 'Financial Manager'];
    if (user && !allowedRoles.includes(user.role?.name)) {
        return <AccessDenied />;
    }

    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [form, setForm] = useState({ title: '', image_url: '', link_url: '', description: '', valid_until: '' });

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await adService.getAllAds();
            setAds(res.data || []);
        } catch (error) {
            toast.error('Failed to load ads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adService.createAd(form);
            toast.success('Ad created successfully');
            setIsModalOpen(false);
            setForm({ title: '', image_url: '', link_url: '', description: '', valid_until: '' });
            fetchAds();
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to create ad');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await adService.deleteAd(id);
            toast.success('Ad deleted');
            fetchAds();
        } catch (error) {
            toast.error('Failed to delete ad');
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-indigo-500" />
                        Ads & Store Manager
                    </h1>
                    <p className="text-sm text-slate-500">Manage promotional banners and internal campaigns.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Create Ad Banner
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Loading Ads...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {ads.map(ad => (
                        <div key={ad.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                            <div className="h-40 bg-slate-100 relative">
                                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                                {!ad.active && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                                        INACTIVE
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-slate-900">{ad.title}</h3>
                                    <button onClick={() => handleDelete(ad.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500 mb-2">{ad.description}</p>

                                <div className="mt-auto space-y-2 text-xs text-slate-600">
                                    {ad.link_url && (
                                        <div className="flex items-center gap-2">
                                            <LinkIcon className="w-3 h-3" />
                                            <a href={ad.link_url} target="_blank" className="hover:underline text-blue-600 truncate">{ad.link_url}</a>
                                        </div>
                                    )}
                                    {ad.valid_until && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>Expires: {new Date(ad.valid_until).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {ads.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500">No active ads.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 border-b border-slate-100 font-bold">Create New Ad</div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input required className="w-full border p-2 rounded" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input required className="w-full border p-2 rounded" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea className="w-full border p-2 rounded" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Link URL</label>
                                <input className="w-full border p-2 rounded" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Valid Until (Optional)</label>
                                <input type="date" className="w-full border p-2 rounded" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded">Create Ad</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
