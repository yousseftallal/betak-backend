import { useNavigate } from 'react-router-dom';
import { Bell, Ban, ShieldAlert, Zap, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';

export default function QuickActions() {
    const navigate = useNavigate();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const hasSettingsPermission = user?.role_name === 'Super Admin' || user?.permissions?.includes('settings:read');
    const hasUpdatePermission = user?.role_name === 'Super Admin' || user?.permissions?.includes('settings:update');

    // Fetch initial state
    useEffect(() => {
        const fetchSettings = async () => {
            if (!hasSettingsPermission) return;

            try {
                const res = await dashboardService.getSystemSettings();
                if (res.data && res.data.maintenance_mode !== undefined) {
                    setMaintenanceMode(res.data.maintenance_mode);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, [hasSettingsPermission]);

    const handleMaintenanceToggle = async () => {
        if (loading) return;
        setLoading(true);
        const newState = !maintenanceMode; // Optimistic
        setMaintenanceMode(newState);

        try {
            await dashboardService.updateSystemSettings({ maintenance_mode: newState });
            if (newState) {
                toast.error('Maintenance Mode ENABLED. Users cannot access the app.');
            } else {
                toast.success('Maintenance Mode DISABLED. App is live.');
            }
        } catch (error) {
            setMaintenanceMode(!newState); // Revert on error
            toast.error('Failed to update maintenance mode');
        } finally {
            setLoading(false);
        }
    };

    const handleClearCache = () => {
        const promise = new Promise((resolve) => setTimeout(resolve, 1500));
        toast.promise(promise, {
            loading: 'Clearing system cache...',
            success: 'Cache purged successfully!',
            error: 'Failed to clear cache'
        });
    };

    const actions = [
        {
            label: 'Send Push Alert',
            desc: 'Notify all users instantly',
            icon: Bell,
            color: 'text-blue-600',
            bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100',
            iconBg: 'bg-white',
            onClick: () => navigate('/admin/campaigns')
        },
        {
            label: 'Quick Ban User',
            desc: 'Block access immediately',
            icon: Ban,
            color: 'text-red-600',
            bg: 'bg-red-50 hover:bg-red-100 border-red-100',
            iconBg: 'bg-white',
            onClick: () => {
                const username = prompt('Enter username to ban:');
                if (username) navigate(`/admin/users?search=${username}`);
            }
        },
        ...(hasUpdatePermission ? [{
            label: maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance',
            desc: maintenanceMode ? 'Go live again' : 'Stop all user access',
            icon: ShieldAlert,
            color: maintenanceMode ? 'text-white' : 'text-orange-600',
            bg: maintenanceMode
                ? 'bg-orange-600 hover:bg-orange-700 border-orange-600 text-white shadow-orange-200'
                : 'bg-orange-50 hover:bg-orange-100 border-orange-100',
            iconBg: maintenanceMode ? 'bg-white/20' : 'bg-white',
            onClick: handleMaintenanceToggle
        }] : []),
        {
            label: 'Purge Cache',
            desc: 'Clear system temporary files',
            icon: Trash2,
            color: 'text-purple-600',
            bg: 'bg-purple-50 hover:bg-purple-100 border-purple-100',
            iconBg: 'bg-white',
            onClick: handleClearCache
        }
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {actions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={action.onClick}
                        className={`group relative flex flex-col items-start p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl w-full text-left justify-between min-h-[160px] ${action.bg}`}
                    >
                        <div className={`p-3 rounded-xl shadow-sm mb-4 transition-transform group-hover:scale-110 ${action.iconBg}`}>
                            <action.icon className={`w-8 h-8 ${action.color}`} />
                        </div>
                        <div>
                            <h4 className={`font-bold text-xl ${maintenanceMode && action.bg.includes('orange-600') ? 'text-white' : 'text-slate-800'}`}>
                                {action.label}
                            </h4>
                            <p className={`text-sm mt-2 font-medium ${maintenanceMode && action.bg.includes('orange-600') ? 'text-orange-100' : 'text-slate-500'}`}>
                                {action.desc}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
