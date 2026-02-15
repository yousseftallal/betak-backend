import { cn } from '../../utils/cn';

export default function StatusBadge({ status, className }) {
    const styles = {
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        suspended: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        banned: "bg-red-500/10 text-red-400 border-red-500/20",
        pending: "bg-slate-700/50 text-slate-400 border-slate-700",
        verified: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    };

    const normalizedStatus = status?.toLowerCase() || 'pending';
    const style = styles[normalizedStatus] || styles.pending;

    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center justify-center", // Added inline-flex and styling
            style,
            className
        )}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
        </span>
    );
}
