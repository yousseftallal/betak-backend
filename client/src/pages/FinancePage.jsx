import { useState, useEffect } from 'react';
import { financeService } from '../services/financeService';
import { userService } from '../services/userService';
import { dashboardService } from '../services/dashboardService';
import DataTable from '../components/ui/DataTable';
import { Wallet, CreditCard, Ticket, Check, X, RefreshCw, Plus, DollarSign, Copy } from 'lucide-react';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../components/ui/AccessDenied';

export default function FinancePage() {
    const { user } = useAuth();

    // Authorization Check
    const allowedRoles = ['Super Admin', 'Admin', 'Financial Manager'];
    if (user && !allowedRoles.includes(user.role?.name)) {
        return <AccessDenied />;
    }

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests'); // requests, vouchers, transfer

    // Data States
    const [requests, setRequests] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ pending: 0, total_sales: 0 });

    // Transfer Form
    const [transferForm, setTransferForm] = useState({ userId: '', amount: '', type: 'credit' });
    const [transferStatus, setTransferStatus] = useState(null);
    const [transferUser, setTransferUser] = useState(null);
    const [usernameInput, setUsernameInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Voucher Form
    const [voucherForm, setVoucherForm] = useState({ amount: '', count: '1' });
    const [voucherStatus, setVoucherStatus] = useState(null);
    const [generatedVouchers, setGeneratedVouchers] = useState([]);
    const [showVoucherModal, setShowVoucherModal] = useState(false);

    // Automation Settings State
    const [financeSettings, setFinanceSettings] = useState({
        auto_withdraw: false,
        high_value_alert: true
    });

    useEffect(() => {
        fetchData();
        if (activeTab === 'settings') {
            fetchFinanceSettings();
        }
    }, [activeTab]);

    const fetchFinanceSettings = async () => {
        try {
            const res = await dashboardService.getSystemSettings();
            if (res.success && res.data) {
                setFinanceSettings({
                    auto_withdraw: res.data.finance_auto_withdraw ?? false,
                    high_value_alert: res.data.finance_high_value_alert ?? true
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSetting = async (key) => {
        // Optimistic UI update
        const stateKey = key === 'finance_auto_withdraw' ? 'auto_withdraw' : 'high_value_alert';
        const newValue = !financeSettings[stateKey];

        setFinanceSettings(prev => ({ ...prev, [stateKey]: newValue }));

        try {
            await dashboardService.updateSystemSettings({ [key]: newValue });
            toast.success('Settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
            // Revert on error
            setFinanceSettings(prev => ({ ...prev, [stateKey]: !newValue }));
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'requests') {
                const res = await financeService.getRequests();
                setRequests(res.data || []);
            } else if (activeTab === 'vouchers') {
                const res = await financeService.getVouchers();
                setVouchers(res.data || []);
            } else if (activeTab === 'transactions') {
                const res = await financeService.getTransactions();
                setVouchers(prev => prev); // Dummy update or use separate state
                // Note: Ideally use separate state 'transactions', but for speed reusing or adding new one.
                // Let's add new state 'transactions'
                setTransactions(res.data || []);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this request? A voucher will be generated.')) return;
        try {
            await financeService.approveRequest(id);
            toast.success('Request approved');
            fetchData(); // Refresh
        } catch (error) {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this request?')) return;
        try {
            await financeService.rejectRequest(id);
            toast.success('Request rejected');
            fetchData();
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    const handleGenerateVoucher = async (e) => {
        e.preventDefault();
        setVoucherStatus('generating...');
        const loadingToast = toast.loading('Generating vouchers...');
        try {
            const res = await financeService.generateVouchers({
                amount: parseInt(voucherForm.amount),
                count: parseInt(voucherForm.count)
            });
            setVoucherStatus('success');
            setVoucherForm({ amount: '', count: '1' });

            if (res.data) {
                setGeneratedVouchers(res.data);
                setShowVoucherModal(true);
            }

            fetchData(); // Refresh list if on vouchers tab
            setActiveTab('vouchers');
            toast.success('Vouchers Generated!', { id: loadingToast });
        } catch (error) {
            setVoucherStatus('error');
            toast.error('Failed to generate vouchers', { id: loadingToast });
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied!');
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        setTransferStatus('processing...');
        const loadingToast = toast.loading('Processing transfer...');
        try {
            await financeService.creditUser({
                userId: transferForm.userId,
                amount: parseInt(transferForm.amount),
                type: transferForm.type
            });
            setTransferStatus('success');
            setTransferForm({ userId: '', amount: '', type: 'credit' });
            setUsernameInput(''); // Clear username too
            setTransferUser(null);
            toast.success(`Transaction Successful!`, { id: loadingToast });
        } catch (error) {
            setTransferStatus('error');
            toast.error('Transaction Failed', { id: loadingToast });
        }
    };

    // Columns
    const requestColumns = [
        { key: 'id', label: 'ID', render: (row) => <span className="text-xs text-slate-500">#{row.id}</span> },
        {
            key: 'user.username', label: 'User', render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200 overflow-hidden">
                        {row.user?.avatar_url ? <img src={row.user.avatar_url} className="w-full h-full object-cover" /> : row.user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{row.user?.username || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">User ID: {row.user?.id}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'amount', label: 'Amount', render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-emerald-400 text-lg flex items-center gap-1">
                        <DollarSign size={14} /> {row.amount}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Points</span>
                </div>
            )
        },
        {
            key: 'payment_method', label: 'Method', render: (row) => (
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                    {row.payment_method}
                </span>
            )
        },
        { key: 'transaction_reference', label: 'Reference', render: (row) => <span className="text-sm text-slate-400 font-mono">{row.transaction_reference || '-'}</span> },
        {
            key: 'status', label: 'Status', render: (row) => (
                <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border flex w-fit items-center gap-1",
                    row.status === 'approved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        row.status === 'rejected' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                )}>
                    {row.status === 'approved' && <Check size={12} />}
                    {row.status === 'rejected' && <X size={12} />}
                    {row.status === 'pending' && <RefreshCw size={12} className="animate-spin-slow" />}
                    {row.status.toUpperCase()}
                </span>
            )
        },
        {
            key: 'generated_voucher_code', label: 'Voucher', render: (row) => (
                row.generated_voucher_code ? (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => handleCopyCode(row.generated_voucher_code)}>
                        <code className="bg-slate-950 px-2 py-1 rounded text-xs border border-slate-800 group-hover:border-blue-500/50 transition-colors text-blue-400">
                            {row.generated_voucher_code}
                        </code>
                        <Copy size={12} className="text-slate-600 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ) : <span className="text-slate-600">-</span>
            )
        },
        {
            key: 'actions', label: 'Actions', render: (row) => (
                row.status === 'pending' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleApprove(row.id)}
                            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/20 transition-all hover:scale-105"
                            title="Approve Request"
                        >
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => handleReject(row.id)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 border border-red-500/20 transition-all hover:scale-105"
                            title="Reject Request"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )
            )
        },
    ];

    const voucherColumns = [
        {
            key: 'code', label: 'Voucher Code', render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Ticket size={18} />
                    </div>
                    <div>
                        <code className="font-mono text-slate-900 font-medium tracking-wide">{row.code}</code>
                        {row.is_used && <span className="ml-2 text-[10px] text-red-500 uppercase font-bold">Used</span>}
                    </div>
                </div>
            )
        },
        {
            key: 'amount', label: 'Value', render: (row) => (
                <span className="font-bold text-emerald-400 text-lg">{row.amount}</span>
            )
        },
        {
            key: 'status', label: 'Status', render: (row) => (
                <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border",
                    row.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                )}>{row.status.toUpperCase()}</span>
            )
        },
        {
            key: 'creator.username', label: 'Created By', render: (row) => (
                <span className="text-sm text-slate-300 flex items-center gap-1">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">{row.creator?.username?.[0]}</span>
                    {row.creator?.username || 'System'}
                </span>
            )
        },
        {
            key: 'redeemer.username', label: 'Redeemed By', render: (row) => (
                row.redeemer ? (
                    <span className="text-sm text-white flex items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">{row.redeemer.username[0]}</span>
                        {row.redeemer.username}
                    </span>
                ) : <span className="text-slate-600 italic">Unused</span>
            )
        },
        { key: 'redeemed_at', label: 'Redeemed At', render: row => <span className="text-xs text-slate-500">{row.redeemed_at ? new Date(row.redeemed_at).toLocaleString() : '-'}</span> },
    ];

    const handleExport = () => {
        if (!transactions || transactions.length === 0) {
            toast.error('No transactions to export');
            return;
        }

        // CSV Header
        const headers = ['ID', 'User', 'Type', 'Amount', 'Description', 'Date', 'Status', 'Reference'];

        // CSV Rows
        const rows = transactions.map(t => [
            t.id,
            t.user?.username || 'Unknown',
            t.type,
            t.amount,
            `"${t.description || ''}"`, // Quote description to handle commas
            new Date(t.created_at).toLocaleString(),
            t.status,
            t.reference_id || ''
        ]);

        // Combine
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-emerald-500" />
                    Financial Management
                </h1>
                <p className="text-slate-500">Manage wallets, points, vouchers, and charge requests.</p>
            </div>

            {/* Quick Stats Grid can go here */}

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={cn("pb-2 px-1 text-sm font-medium transition-colors", activeTab === 'requests' ? "border-b-2 border-emerald-500 text-emerald-600" : "text-slate-500 hover:text-slate-900")}
                >
                    Charge Requests
                </button>
                <button
                    onClick={() => setActiveTab('vouchers')}
                    className={cn("pb-2 px-1 text-sm font-medium transition-colors", activeTab === 'vouchers' ? "border-b-2 border-emerald-500 text-emerald-600" : "text-slate-500 hover:text-slate-900")}
                >
                    Vouchers
                </button>
                <button
                    onClick={() => setActiveTab('transfer')}
                    className={cn("pb-2 px-1 text-sm font-medium transition-colors", activeTab === 'transfer' ? "border-b-2 border-emerald-500 text-emerald-600" : "text-slate-500 hover:text-slate-900")}
                >
                    Manual Transfer
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={cn("pb-2 px-1 text-sm font-medium transition-colors", activeTab === 'transactions' ? "border-b-2 border-emerald-500 text-emerald-600" : "text-slate-500 hover:text-slate-900")}
                >
                    Transactions
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn("pb-2 px-1 text-sm font-medium transition-colors", activeTab === 'settings' ? "border-b-2 border-emerald-500 text-emerald-600" : "text-slate-500 hover:text-slate-900")}
                >
                    Settings
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {loading ? <div className="text-center text-slate-500 py-10">Loading...</div> : (
                    <>
                        {activeTab === 'requests' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-900">Pending Requests</h3>
                                    <div className="flex gap-2">
                                        <button onClick={fetchData} className="p-2 bg-slate-100 rounded hover:bg-slate-200 text-slate-600"><RefreshCw size={16} /></button>
                                    </div>
                                </div>
                                <DataTable
                                    columns={requestColumns}
                                    data={requests}
                                    pageSize={10}
                                />
                            </div>
                        )}

                        {activeTab === 'vouchers' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-slate-900">All Vouchers</h3>
                                        <button onClick={fetchData} className="p-2 bg-slate-100 rounded hover:bg-slate-200 text-slate-600"><RefreshCw size={16} /></button>
                                    </div>
                                    <DataTable
                                        columns={voucherColumns}
                                        data={vouchers}
                                        pageSize={10}
                                    />
                                </div>

                                {/* Generator Form */}
                                <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Plus size={18} /> Generate Codes</h3>
                                    <form onSubmit={handleGenerateVoucher} className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-slate-700 mb-1">Points Amount</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="e.g. 100"
                                                value={voucherForm.amount}
                                                onChange={e => setVoucherForm({ ...voucherForm, amount: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-700 mb-1">Count (Number of cards)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                value={voucherForm.count}
                                                onChange={e => setVoucherForm({ ...voucherForm, count: e.target.value })}
                                                min="1" max="100"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium">
                                            {voucherStatus === 'generating...' ? 'Generating...' : 'Generate Codes'}
                                        </button>
                                        {voucherStatus === 'success' && <div className="text-emerald-600 text-sm text-center">Vouchers Generated!</div>}
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transfer' && (
                            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-8 mt-8 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <DollarSign className="w-6 h-6 text-emerald-500" />
                                    Manual Wallet Adjustment
                                </h3>
                                <form onSubmit={handleTransfer} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-700 mb-1">Username</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="Search by username..."
                                                value={usernameInput}
                                                onChange={async (e) => {
                                                    const val = e.target.value;
                                                    setUsernameInput(val);
                                                    setTransferUser(null);
                                                    setTransferForm(prev => ({ ...prev, userId: '' }));

                                                    if (val.length > 1) {
                                                        try {
                                                            const res = await userService.getUsers({ search: val, limit: 5 });
                                                            if (res.data && res.data.rows) {
                                                                setSearchResults(res.data.rows);
                                                            }
                                                        } catch (err) {
                                                            console.error(err);
                                                        }
                                                    } else {
                                                        setSearchResults([]);
                                                    }
                                                }}
                                                autoComplete="off"
                                                required
                                            />
                                            {/* Autocomplete Dropdown */}
                                            {searchResults.length > 0 && !transferUser && (
                                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-1 z-50 max-h-48 overflow-y-auto">
                                                    {searchResults.map(u => (
                                                        <div
                                                            key={u.id}
                                                            className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                            onClick={() => {
                                                                setTransferUser(u);
                                                                setTransferForm(prev => ({ ...prev, userId: u.id }));
                                                                setUsernameInput(u.username);
                                                                setSearchResults([]);
                                                            }}
                                                        >
                                                            <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden flex-shrink-0">
                                                                {u.avatar_url ? (
                                                                    <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">{u.username?.[0]}</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900">{u.username}</p>
                                                                <p className="text-xs text-slate-500">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {transferUser && (
                                            <div className="mt-2 flex items-center justify-between p-3 bg-emerald-50 rounded border border-emerald-200 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden flex-shrink-0">
                                                        {transferUser.avatar_url ? (
                                                            <img src={transferUser.avatar_url} alt={transferUser.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">{transferUser.username?.[0]}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{transferUser.username}</p>
                                                        <p className="text-xs text-slate-500">{transferUser.email}</p>
                                                        <p className="text-[10px] text-emerald-600 mt-0.5">ID: {transferUser.id}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTransferUser(null);
                                                        setTransferForm(prev => ({ ...prev, userId: '' }));
                                                        setUsernameInput('');
                                                    }}
                                                    className="p-1 hover:bg-emerald-100 rounded text-emerald-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-700 mb-1">Amount (Points)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="e.g. 500"
                                            value={transferForm.amount}
                                            onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-700 mb-1">Action Type</label>
                                        <select
                                            className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={transferForm.type}
                                            onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}
                                        >
                                            <option value="credit">Credit (Add Points)</option>
                                            <option value="debit">Debit (Remove Points)</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!transferForm.userId || !transferForm.amount}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded font-medium mt-4 transition-colors"
                                    >
                                        {transferStatus === 'processing...' ? 'Processing...' : 'Confirm Transfer'}
                                    </button>
                                    {transferStatus === 'success' && <div className="text-emerald-600 text-sm text-center">Transaction Successful!</div>}
                                    {transferStatus === 'error' && <div className="text-red-500 text-sm text-center">Transaction Failed</div>}
                                </form>
                            </div>
                        )}

                        {activeTab === 'transactions' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
                                    <button
                                        onClick={handleExport}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 text-sm font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <Copy size={14} /> Export CSV
                                    </button>
                                </div>
                                <DataTable
                                    columns={[
                                        { key: 'id', label: 'ID', render: r => <span className="font-mono text-xs text-slate-500">#{r.id}</span> },
                                        { key: 'user.username', label: 'User', render: r => <span className="text-sm font-medium">{r.user?.username}</span> },
                                        {
                                            key: 'type', label: 'Type', render: r => (
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${r.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {r.type}
                                                </span>
                                            )
                                        },
                                        { key: 'amount', label: 'Amount', render: r => <span className={`font-mono font-bold ${r.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>{r.type === 'credit' ? '+' : '-'}{r.amount}</span> },
                                        { key: 'description', label: 'Description', render: r => <span className="text-sm text-slate-600">{r.description}</span> },
                                        { key: 'created_at', label: 'Date', render: r => <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString()}</span> }
                                    ]}
                                    data={transactions}
                                    pageSize={10}
                                />
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-8 mt-8 shadow-sm animate-in zoom-in-95">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <RefreshCw className="w-6 h-6 text-blue-500" />
                                    Automation Settings
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Auto-Approve Withdrawals</h4>
                                            <p className="text-sm text-slate-500">Automatically process withdrawals under 500 points.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={financeSettings.auto_withdraw}
                                                onChange={() => toggleSetting('finance_auto_withdraw')}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div>
                                            <h4 className="font-semibold text-slate-900">High Value Alerts</h4>
                                            <p className="text-sm text-slate-500">Notify admins for transactions over 10,000 points.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={financeSettings.high_value_alert}
                                                onChange={() => toggleSetting('finance_high_value_alert')}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* Voucher Modal */}
            {showVoucherModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Generated Vouchers</h3>
                            <button onClick={() => setShowVoucherModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <p className="text-sm text-slate-500 mb-4">
                                Successfully generated {generatedVouchers.length} voucher(s). Copy them below:
                            </p>
                            <div className="space-y-3">
                                {generatedVouchers.map((voucher) => (
                                    <div key={voucher.id} className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 gap-3">
                                        <div className="flex-1 text-center sm:text-left">
                                            <code className="text-emerald-600 font-mono text-lg font-bold block">{voucher.code}</code>
                                            <span className="text-xs text-slate-500">{voucher.amount} Points</span>
                                        </div>
                                        <button
                                            onClick={() => handleCopyCode(voucher.code)}
                                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-blue-600 rounded transition-colors"
                                            title="Copy Code"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setShowVoucherModal(false)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
