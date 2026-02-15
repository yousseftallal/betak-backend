import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Star } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function VideoFilters({ onFilterChange, onReset }) {
    const [searchParams, setSearchParams] = useSearchParams();

    // Local state for inputs
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [isFeatured, setIsFeatured] = useState(searchParams.get('is_featured') || '');
    const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
    const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleParamChange('search', search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleParamChange = (key, value) => {
        const prev = Object.fromEntries(searchParams);
        if (value) {
            prev[key] = value;
        } else {
            delete prev[key];
        }
        setSearchParams(prev);
        onFilterChange(prev); // Trigger parent update
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setCategory('');
        setIsFeatured('');
        setDateFrom('');
        setDateTo('');
        setSearchParams({});
        onReset();
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-sm uppercase tracking-wide">
                <Filter className="w-4 h-4" />
                Advanced Filters
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search title, ID, or user ID..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Status */}
                <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-blue-500"
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        handleParamChange('status', e.target.value);
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                    <option value="deleted">Deleted</option>
                </select>

                {/* Category */}
                <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-blue-500"
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        handleParamChange('category', e.target.value);
                    }}
                >
                    <option value="">All Categories</option>
                    <option value="comedy">Comedy</option>
                    <option value="education">Education</option>
                    <option value="travel">Travel</option>
                    <option value="food">Food</option>
                    <option value="fitness">Fitness</option>
                    <option value="tech">Tech</option>
                    <option value="gaming">Gaming</option>
                    <option value="music">Music</option>
                </select>

                {/* Featured Toggle */}
                <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-blue-500"
                    value={isFeatured}
                    onChange={(e) => {
                        setIsFeatured(e.target.value);
                        handleParamChange('is_featured', e.target.value);
                    }}
                >
                    <option value="">Featured: Any</option>
                    <option value="true">Featured Only</option>
                    <option value="false">Not Featured</option>
                </select>

                {/* Date Range */}
                <div className="flex items-center gap-2 col-span-1 md:col-span-2 lg:col-span-3">
                    <span className="text-xs font-medium text-slate-500">Uploaded:</span>
                    <input
                        type="date"
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            handleParamChange('date_from', e.target.value);
                        }}
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="date"
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            handleParamChange('date_to', e.target.value);
                        }}
                    />
                </div>

                {/* Reset */}
                <div className="flex justify-end col-span-1">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
