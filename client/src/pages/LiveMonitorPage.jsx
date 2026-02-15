import React, { useState, useEffect } from 'react';
import { Eye, User, MoreVertical, Ban, ShieldAlert, Signal, StopCircle, X } from 'lucide-react';
import liveService from '../services/liveService';
import toast from 'react-hot-toast';

const LiveMonitorPage = () => {
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStream, setSelectedStream] = useState(null);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banDuration, setBanDuration] = useState('24h');

    // Mosaic Grid State
    const [gridSize, setGridSize] = useState(4); // Default 4 cols (Desktop)

    const getGridClass = () => {
        switch (gridSize) {
            case 2: return 'grid-cols-1 md:grid-cols-2';
            case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
            case 5: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
            case 6: return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        }
    };

    // Fetch Streams
    const fetchStreams = async () => {
        try {
            setLoading(true);
            const data = await liveService.getStreams();
            // Add random colors for UI if not present
            const processed = data.data.map(s => ({
                ...s,
                thumbnailColor: ['bg-slate-200', 'bg-slate-300', 'bg-zinc-200', 'bg-neutral-200'][Math.floor(Math.random() * 4)]
            }));
            setStreams(processed);
        } catch (error) {
            console.error('Failed to fetch streams', error);
            toast.error('Failed to load active streams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStreams();
        // Poll every 30 seconds
        const interval = setInterval(fetchStreams, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleEndStream = async (id) => {
        if (window.confirm('Are you sure you want to end this stream?')) {
            try {
                await liveService.endStream(id);
                setStreams(streams.filter(s => s.id !== id));
                toast.success('Stream ended successfully');
            } catch (error) {
                toast.error('Failed to end stream');
            }
        }
    };

    const openBanModal = (stream) => {
        setSelectedStream(stream);
        setShowBanModal(true);
    };

    const handleBanUser = async () => {
        if (!selectedStream) return;
        try {
            await liveService.banUser(selectedStream.id, banDuration);
            setShowBanModal(false);
            setStreams(streams.filter(s => s.id !== selectedStream.id)); // Remove stream as it's ended/banned
            toast.success(`User ${selectedStream.user?.username} has been banned for ${banDuration}.`);
        } catch (error) {
            toast.error('Failed to ban user');
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <Signal className="w-6 h-6 text-red-500 animate-pulse" />
                        Live Monitor (Mosaic)
                    </h1>
                    <p className="text-sm text-slate-500">Real-time oversight. Showing {streams.length} active streams.</p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    {/* Grid Controls */}
                    <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center gap-1">
                        {[3, 4, 5, 6].map(size => (
                            <button
                                key={size}
                                onClick={() => setGridSize(size)}
                                className={`px-2 py-1 text-xs font-bold rounded ${gridSize === size ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                title={`${size} Columns`}
                            >
                                {size}x
                            </button>
                        ))}
                    </div>

                    <div className="px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 font-medium text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        {streams.length} Active
                    </div>
                    <button onClick={fetchStreams} className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Refresh</button>
                </div>
            </div>

            {/* Loading State */}
            {loading && streams.length === 0 && (
                <div className="text-center py-12 text-slate-500">Loading streams...</div>
            )}

            {/* Empty State */}
            {!loading && streams.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Signal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No active streams right now.</p>
                </div>
            )}

            {/* Streams Grid */}
            <div className={`grid ${getGridClass()} gap-4 transition-all duration-300`}>
                {streams.map((stream) => (
                    <div key={stream.id} className="group relative bg-black rounded-xl overflow-hidden aspect-[9/16] shadow-lg border border-slate-800">
                        {/* Thumbnail */}
                        <div className="absolute inset-0">
                            {stream.thumbnail_url ? (
                                <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                            ) : (
                                <div className={`w-full h-full ${stream.thumbnailColor} opacity-20 group-hover:opacity-10 transition-opacity`}></div>
                            )}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-slate-700 font-bold opacity-0">LIVE</p>
                        </div>

                        {/* Overlay Info */}
                        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white overflow-hidden border border-slate-600">
                                        {stream.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium shadow-black drop-shadow-md truncate max-w-[100px]">{stream.user?.username || 'Unknown'}</p>
                                        <p className="text-slate-300 text-xs flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {stream.viewers_count.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider animate-pulse">
                                    LIVE
                                </div>
                            </div>
                        </div>

                        {/* Reports Warning */}
                        {stream.reports_count > 0 && (
                            <div className="absolute top-16 left-4 flex gap-2">
                                <div className="px-2 py-1 bg-orange-500/90 text-white text-xs rounded flex items-center gap-1 backdrop-blur-sm">
                                    <ShieldAlert className="w-3 h-3" />
                                    {stream.reports_count} Reports
                                </div>
                            </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                                onClick={() => handleEndStream(stream.id)}
                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-medium text-sm transition-transform hover:scale-105 flex items-center gap-2"
                            >
                                <StopCircle className="w-4 h-4" /> End Stream
                            </button>
                            <button
                                onClick={() => openBanModal(stream)}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium text-sm transition-transform hover:scale-105 flex items-center gap-2"
                            >
                                <Ban className="w-4 h-4" /> Ban & End
                            </button>
                            <div className="mt-4 text-slate-400 text-xs font-mono">
                                ID: {stream.id}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Ban Context Modal */}
            {showBanModal && selectedStream && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Ban className="w-5 h-5 text-red-600" />
                                Ban User from Live
                            </h3>
                            <button onClick={() => setShowBanModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-slate-600 mb-2">
                                You are about to end the stream and ban <strong>@{selectedStream.user?.username}</strong> from going live.
                            </p>
                            <p className="text-sm font-medium text-slate-900 mb-3">Select Ban Duration:</p>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: '24 Hours', value: '24h' },
                                    { label: '3 Days', value: '3d' },
                                    { label: '1 Week', value: '1w' },
                                    { label: '1 Month', value: '1m' },
                                    { label: 'Permanent', value: 'permanent' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setBanDuration(opt.value)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${banDuration === opt.value
                                            ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowBanModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBanUser}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200"
                            >
                                Confirm Ban
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveMonitorPage;
