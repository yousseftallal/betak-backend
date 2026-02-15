import { useState } from 'react';
import { Shield, Plus, Trash2, Edit2, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AutoModerationPage() {
    const [rules, setRules] = useState([
        { id: 1, name: 'High Nudity Ban', type: 'video_analysis', condition: 'nudity_score > 0.90', action: 'ban_user', active: true },
        { id: 2, name: 'Spam Comment Filter', type: 'text_analysis', condition: 'spam_score > 0.85', action: 'delete_comment', active: true },
        { id: 3, name: 'Violence Alert', type: 'video_analysis', condition: 'violence_score > 0.75', action: 'flag_for_review', active: false },
    ]);

    const handleToggle = (id) => {
        setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
        toast.success('Rule status updated');
    };

    const handleDelete = (id) => {
        if (confirm('Delete this rule?')) {
            setRules(rules.filter(r => r.id !== id));
            toast.success('Rule deleted');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        Auto-Moderation Rules
                    </h1>
                    <p className="text-slate-500">Configure AI rules to automatically moderate content.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    New Rule
                </button>
            </div>

            {/* Rules List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Rule Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Condition (Logic)</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{rule.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200 font-mono">
                                            {rule.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-blue-600 bg-blue-50/50 rounded p-1">
                                        {rule.condition}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${rule.action === 'ban_user' ? 'bg-red-100 text-red-600 border border-red-200' :
                                                rule.action === 'flag_for_review' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {rule.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggle(rule.id)}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${rule.active ? 'bg-blue-600' : 'bg-slate-200'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${rule.active ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(rule.id)} className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Status Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <PlayCircle className="w-5 h-5 text-green-400" />
                        <h3 className="font-bold">AI Engine Status</h3>
                    </div>
                    <p className="text-slate-400 text-sm">Running normally. Latency: 45ms</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold">Items Scanned Today</h3>
                    </div>
                    <p className="text-2xl font-bold">14,205</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="font-bold">Auto-Actions Taken</h3>
                    </div>
                    <p className="text-2xl font-bold">128</p>
                </div>
            </div>
        </div>
    );
}
