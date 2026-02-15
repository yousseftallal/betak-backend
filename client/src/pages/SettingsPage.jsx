import { useState, useEffect } from 'react';
import { Save, AlertTriangle, ShieldCheck, Mail, Database } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../components/ui/AccessDenied';

export default function SettingsPage() {
    const { user } = useAuth();

    // Authorization Check
    const allowedRoles = ['Super Admin', 'Admin'];
    if (user && !allowedRoles.includes(user.role?.name)) {
        return <AccessDenied />;
    }

    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        maintenance_mode: false,
        signups_enabled: true,
        email_notifications: true,
        auto_ban_threshold: 5,
        max_upload_size: 500, // MB
        platform_fee_percent: 15,
        storage_provider: 'local'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                if (data.data) {
                    // Merge with defaults to ensure all keys exist
                    setConfig(prev => ({ ...prev, ...data.data }));
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
                toast.error('Failed to load settings');
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await settingsService.updateSettings(config);
            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 tracking-tight">System Settings</h1>
                    <p className="text-slate-500">Configure global platform behavior and policies.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* General Safety */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-base font-bold text-slate-900 flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" />
                        Safety & Moderation
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-slate-900 block">Maintenance Mode</label>
                            <p className="text-xs text-slate-500">Disable platform access for all non-admin users.</p>
                        </div>
                        <Toggle
                            checked={config.maintenance_mode}
                            onChange={(v) => handleChange('maintenance_mode', v)}
                            variant="danger"
                        />
                    </div>

                    <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-slate-900 block">Allow New Signups</label>
                            <p className="text-xs text-slate-500">If disabled, new users cannot register.</p>
                        </div>
                        <Toggle
                            checked={config.signups_enabled}
                            onChange={(v) => handleChange('signups_enabled', v)}
                        />
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <label className="text-sm font-medium text-slate-900 block mb-2">Auto-Ban Threshold (Reports)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1" max="20"
                                value={config.auto_ban_threshold}
                                onChange={(e) => handleChange('auto_ban_threshold', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="w-12 text-center text-sm font-bold text-blue-600 bg-blue-50 rounded py-1 border border-blue-100">
                                {config.auto_ban_threshold}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Users receiving this many reports in 24h will be auto-suspended.</p>
                    </div>
                </div>
            </div>

            {/* Monetization Config */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-base font-bold text-slate-900 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-purple-500" />
                        System Limits & Fees
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Platform Fee (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={config.platform_fee_percent}
                                onChange={(e) => handleChange('platform_fee_percent', parseFloat(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Max Video Size (MB)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={config.max_upload_size}
                                onChange={(e) => handleChange('max_upload_size', parseFloat(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-slate-500">MB</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Storage & Backups */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-base font-bold text-slate-900 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-blue-500" />
                        Storage & Database
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="text-sm font-medium text-slate-900 block mb-2">Storage Provider</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleChange('storage_provider', 'local')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${config.storage_provider === 'local' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                            >
                                <span className="font-bold">Local Storage</span>
                                <span className="text-xs opacity-70">Files stored on server disk</span>
                            </button>
                            <button
                                onClick={() => handleChange('storage_provider', 's3')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${config.storage_provider === 's3' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                            >
                                <span className="font-bold">Amazon S3</span>
                                <span className="text-xs opacity-70">Scalable cloud storage</span>
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <label className="text-sm font-medium text-slate-900 block">Database Backup</label>
                                <p className="text-xs text-slate-500">Last backup: 2 hours ago</p>
                            </div>
                            <button
                                onClick={async () => {
                                    const toastId = toast.loading('Generating backup...');
                                    try {
                                        const res = await settingsService.triggerBackup();
                                        if (res.success && res.data.downloadUrl) {
                                            toast.success('Backup ready! Downloading...', { id: toastId });
                                            // Trigger download
                                            window.open(`${res.data.downloadUrl}`, '_blank');
                                        } else {
                                            toast.error('Backup generated but no link returned', { id: toastId });
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        toast.error(err.response?.data?.error?.message || 'Failed to generate backup', { id: toastId });
                                    }
                                }}
                                className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                Trigger Manual Backup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Toggle({ checked, onChange, variant = 'primary' }) {
    const bgClass = checked
        ? (variant === 'danger' ? 'bg-red-500' : 'bg-blue-600')
        : 'bg-slate-200';

    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bgClass}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );
}
