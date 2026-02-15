import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function StatsCard({ title, value, change, icon: Icon, color = "blue", loading }) {
    const isPositive = change >= 0;

    const colorStyles = {
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-slate-100 rounded animate-pulse"></div>
                    ) : (
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
                    )}
                </div>
                <div className={cn("p-3 rounded-lg border", colorStyles[color])}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {change !== undefined && (
                <div className="mt-4 flex items-center">
                    <span className={cn(
                        "flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
                        isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    )}>
                        {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {Math.abs(change).toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400 ml-2">from last month</span>
                </div>
            )}
        </div>
    );
}
