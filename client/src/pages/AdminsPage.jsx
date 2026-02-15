import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import DataTable from '../components/ui/DataTable';
import { Trash, Shield, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AccessDenied from '../components/ui/AccessDenied';

export default function AdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Strict Access Control: Only Super Admin can view this page
    if (user && user.role?.name !== 'Super Admin') {
        return <AccessDenied />;
    }

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role_id: 2 // Default to Admin
    });
    const [error, setError] = useState('');

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAdmins();
            setAdmins(data.data);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            toast.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;
        try {
            await adminService.deleteAdmin(id);
            toast.success('Admin deleted successfully');
            fetchAdmins();
        } catch (error) {
            const msg = error.response?.data?.error?.message || error.message;
            toast.error('Failed to delete admin: ' + msg);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await adminService.createAdmin(formData);
            toast.success('Admin created successfully');
            setShowCreateModal(false);
            setFormData({ username: '', email: '', password: '', role_id: 2 });
            fetchAdmins();
        } catch (error) {
            const msg = error.response?.data?.error?.message || 'Failed to create admin';
            setError(msg);
            toast.error(msg);
        }
    };

    const columns = [
        {
            header: 'Admin',
            accessor: 'username',
            render: (admin) => (
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 mr-3">
                        {admin.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{admin.username}</div>
                        <div className="text-xs text-slate-500">{admin.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (admin) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${admin.role?.name === 'Super Admin'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                    {admin.role?.name || 'Unknown'}
                </span>
            )
        },
        {
            header: 'Created At',
            accessor: 'created_at',
            render: (admin) => new Date(admin.created_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (admin) => (
                <div className="flex items-center gap-2">
                    {/* Prevent deleting self or Super Admin if not allowed */}
                    {admin.id !== user?.id && (
                        <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Admin"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Admin Management</h1>
                    <p className="text-slate-500">Manage admin accounts and roles.</p>
                </div>
                {user?.role?.name === 'Super Admin' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Admin
                    </button>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns}
                    data={admins}
                    loading={loading}
                    pagination={{ page: 1, limit: 100, total: admins.length }} // Dummy pagination for now
                    onPageChange={() => { }}
                />
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900">Create New Admin</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-4 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={formData.role_id}
                                    onChange={e => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                                >
                                    <option value={1}>Super Admin</option>
                                    <option value={2}>Admin</option>
                                    <option value={3}>Moderator</option>
                                    <option value={4}>Analyst</option>
                                    <option value={6}>Support Agent</option>
                                    <option value={7}>Financial Manager</option>
                                    <option value={8}>Content Manager</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
