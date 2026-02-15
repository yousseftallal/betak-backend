import { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function DataTable({
    columns,
    data = [],
    loading,
    pagination,
    onPageChange,
    onSearch,
    onFilterChange,
    filterValues = {},
    filters = []
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearch) onSearch(value);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Table Header / Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    {filters.map((filter) => (
                        <div key={filter.key} className="relative group">
                            <select
                                className="appearance-none bg-white border border-slate-300 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 hover:bg-slate-50 transition-colors cursor-pointer"
                                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                                value={filterValues[filter.key] || ''}
                            >
                                <option value="">All {filter.label}</option>
                                {filter.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-medium">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 whitespace-nowrap">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            // Loading Skeleton
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (!data || !Array.isArray(data) || data.length === 0) ? (
                            // Empty State
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Search className="w-8 h-8 mb-2 opacity-50" />
                                        <p>No records found matching your criteria</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            // Data Rows
                            (Array.isArray(data) ? data : []).map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-50 transition-colors group">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PaginationFooter */}
            {pagination && (
                <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-900">{((pagination.page || 1) - 1) * (pagination.limit || 10) + 1}</span> to <span className="font-medium text-slate-900">{Math.min((pagination.page || 1) * (pagination.limit || 10), (pagination.total || 0))}</span> of <span className="font-medium text-slate-900">{pagination.total || 0}</span> results
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page * pagination.limit >= pagination.total}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
