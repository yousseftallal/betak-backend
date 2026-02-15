import React, { useState, useEffect } from 'react';
import { Shield, Settings, AlertTriangle, Save, Loader, Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1/admin',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function SafetyPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null); // Add this line

    const [settings, setSettings] = useState({
        moderation_enabled: true,
        ai_sensitivity: 'medium',
        blocklist_keywords: []
    });

    const [keywordInput, setKeywordInput] = useState('');

    // ... useEffect ...

    // ... fetchSettings ...

    // ... handleSave ...

    const addKeyword = (e) => {
        if (e) e.preventDefault(); // Handle both click and form submit
        if (!keywordInput.trim()) return;

        if (settings.blocklist_keywords.includes(keywordInput.trim())) {
            toast.error('Keyword already exists');
            return;
        }

        setSettings(prev => ({
            ...prev,
            blocklist_keywords: [...prev.blocklist_keywords, keywordInput.trim()]
        }));
        setKeywordInput('');
    };

    const saveEdit = (index, newValue) => { // Add this function
        setEditingIndex(null);
        if (!newValue.trim()) return;

        const updatedList = [...settings.blocklist_keywords];
        updatedList[index] = newValue.trim();

        setSettings(prev => ({
            ...prev,
            blocklist_keywords: updatedList
        }));
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings/moderation'); // Route we just added: /settings/:category
            // API returns flat object { key: value }
            if (res.data.success) {
                setSettings(prev => ({ ...prev, ...res.data.data }));
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const payload = {
                moderation_enabled: settings.moderation_enabled,
                ai_sensitivity: settings.ai_sensitivity,
                blocklist_keywords: settings.blocklist_keywords
            };

            await api.patch('/settings/moderation', payload);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };



    const removeKeyword = (word) => {
        setSettings(prev => ({
            ...prev,
            blocklist_keywords: prev.blocklist_keywords.filter(w => w !== word)
        }));
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader className="w-8 h-8 animate-spin text-blue-500" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        Safety & Moderation Center
                    </h1>
                    <p className="text-slate-500">Configure automated content filtering and AI safety protocols.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            {/* Main Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Status Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-slate-500" />
                            Automated Moderation
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.moderation_enabled}
                                onChange={e => setSettings({ ...settings, moderation_enabled: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">
                        When enabled, reported content and keywords will be automatically filtered.
                    </p>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">AI Sensitivity Level</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['low', 'medium', 'high'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setSettings({ ...settings, ai_sensitivity: level })}
                                    className={`py-2 px-4 rounded-lg border capitalize text-sm font-medium transition-all ${settings.ai_sensitivity === level
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            <strong>High:</strong> Strict filtering. <strong>Low:</strong> Allows more content.
                        </p>
                    </div>
                </div>

                {/* Warning Card */}
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-amber-800">Moderation Usage</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Automated moderation applies to Comments, Video Titles, and User Bios.
                                Changes take effect immediately for new content.
                            </p>
                            <div className="mt-4 p-3 bg-white/50 rounded-lg text-sm text-amber-900">
                                <strong>Current Rules:</strong>
                                <ul className="list-disc leading-relaxed ml-4 mt-1">
                                    <li>Block all keywords in list</li>
                                    <li>Auto-hide content with {settings.ai_sensitivity} probability of violation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blocklist Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-lg text-slate-800">Keyword Blocklist</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            placeholder="Add new keyword..."
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && addKeyword(e)}
                        />
                        <button
                            onClick={addKeyword}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-500 text-sm">
                                <th className="py-3 px-4 font-medium">Keyword</th>
                                <th className="py-3 px-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {settings.blocklist_keywords.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="py-8 text-center text-slate-400 italic">
                                        No blocked keywords yet. Add one above.
                                    </td>
                                </tr>
                            ) : (
                                settings.blocklist_keywords.map((word, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 group">
                                        <td className="py-3 px-4 text-slate-700 font-medium">
                                            {editingIndex === idx ? (
                                                <input
                                                    autoFocus
                                                    className="border rounded px-2 py-1 text-sm outline-none ring-2 ring-blue-500"
                                                    defaultValue={word}
                                                    onBlur={(e) => saveEdit(idx, e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(idx, e.currentTarget.value)}
                                                />
                                            ) : (
                                                word
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingIndex(idx)}
                                                    className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeKeyword(word)}
                                                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-xs text-slate-400 text-right">
                    Total: {settings.blocklist_keywords.length} keywords
                </div>
            </div>
        </div>
    );
}
