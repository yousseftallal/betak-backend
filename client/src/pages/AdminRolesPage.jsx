import { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Check, X, Save, AlertTriangle } from 'lucide-react';
import adminService from '../services/adminService';
import DataTable from '../components/ui/DataTable';
import toast from 'react-hot-toast';

export default function AdminRolesPage() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', permissions: [] });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                adminService.getRoles(),
                adminService.getPermissions()
            ]);
            setRoles(rolesRes.data || []);
            setPermissions(permsRes.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load roles data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setFormData({ id: null, name: '', permissions: [] });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEdit = (role) => {
        if (role.name === 'Super Admin') {
            toast.error('Cannot edit Super Admin role');
            return;
        }
        setFormData({
            id: role.id,
            name: role.name,
            permissions: role.permissions ? role.permissions.map(p => p.id) : []
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (name === 'Super Admin' || name === 'Admin') {
            toast.error('Cannot delete core system roles');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete the role "${name}"?`)) return;

        try {
            await adminService.deleteRole(id);
            toast.success('Role deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete role');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setSaving(true);
        try {
            if (isEditing) {
                await adminService.updateRole(formData.id, formData);
                toast.success('Role updated successfully');
            } else {
                await adminService.createRole(formData);
                toast.success('Role created successfully');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const togglePermission = (permId) => {
        setFormData(prev => {
            const hasPerm = prev.permissions.includes(permId);
            return {
                ...prev,
                permissions: hasPerm
                    ? prev.permissions.filter(id => id !== permId)
                    : [...prev.permissions, permId]
            };
        });
    };

    const columns = [
        { key: 'name', label: 'Role Name', render: (row) => <span className="font-bold text-slate-800">{row.name}</span> },
        {
            key: 'permissions',
            label: 'Permissions',
            render: (row) => (
                <div className="flex flex-wrap gap-1 max-w-md">
                    {row.permissions && row.permissions.length > 0 ? (
                        row.permissions.slice(0, 5).map(p => (
                            <span key={p.id} className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                {p.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-slate-400 italic">No permissions</span>
                    )}
                    {row.permissions && row.permissions.length > 5 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                            +{row.permissions.length - 5}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        disabled={row.name === 'Super Admin'}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id, row.name)}
                        disabled={['Super Admin', 'Admin'].includes(row.name)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    // Group permissions by resource for better UI
    const groupedPermissions = permissions.reduce((acc, perm) => {
        // Assuming slug format 'resource:action' or similar, or just grouping by name prefix
        // Let's guess: 'users.manage', 'videos.delete' -> group by 'users', 'videos'
        // If simple name, just 'General'
        const resource = perm.slug.split(':')[0] || 'General';
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(perm);
        return acc;
    }, {});

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        Role Management
                    </h1>
                    <p className="text-slate-500">Define roles and assign access permissions.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-sm shadow-blue-200"
                >
                    <Plus size={18} />
                    Add New Role
                </button>
            </div>

            <div className="border rounded-xl shadow-sm bg-white overflow-hidden">
                <DataTable
                    columns={columns}
                    data={roles}
                    loading={loading}
                    emptyMessage="No roles found."
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">
                                {isEditing ? 'Edit Role' : 'Create New Role'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                                        placeholder="e.g. Content Moderator"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Permissions</label>

                                    {loading ? (
                                        <div className="text-center py-4 text-slate-400">Loading permissions...</div>
                                    ) : (
                                        <div className="space-y-6">
                                            {Object.entries(groupedPermissions).map(([resource, perms]) => (
                                                <div key={resource} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">
                                                        {resource.toUpperCase()}
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {perms.map(perm => (
                                                            <label key={perm.id} className="flex items-start gap-2 cursor-pointer group">
                                                                <div className="relative flex items-center mt-0.5">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="peer sr-only"
                                                                        checked={formData.permissions.includes(perm.id)}
                                                                        onChange={() => togglePermission(perm.id)}
                                                                    />
                                                                    <div className="w-4 h-4 border-2 border-slate-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></div>
                                                                    <Check size={10} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">{perm.name}</span>
                                                                    {perm.description && <p className="text-[10px] text-slate-400 leading-tight">{perm.description}</p>}
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
                                >
                                    {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                                    {isEditing ? 'Update Role' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
