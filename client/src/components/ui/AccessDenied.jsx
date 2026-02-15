import { Shield } from 'lucide-react';

export default function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 animate-in fade-in duration-500">
            <Shield className="w-16 h-16 mb-4 text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-700">Access Denied</h2>
            <p className="mt-2 text-sm text-slate-400">You do not have permission to view this page.</p>
        </div>
    );
}
