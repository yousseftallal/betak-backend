import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Upload, MoreVertical, Search, Music, TrendingUp, AlertCircle, Flag, Star, X } from 'lucide-react';
import musicService from '../services/musicService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../components/ui/AccessDenied';

const MusicPage = () => {
    const { user } = useAuth();

    // Authorization Check
    const allowedRoles = ['Super Admin', 'Admin', 'Content Manager'];
    if (user && !allowedRoles.includes(user.role?.name)) {
        return <AccessDenied />;
    }

    const [activeTab, setActiveTab] = useState('library');
    const [tracks, setTracks] = useState([]);
    const [stats, setStats] = useState({ totalTracks: 0, trendingCount: 0, flaggedCount: 0, totalUses: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Audio State
    const [playing, setPlaying] = useState(null); // ID of track playing
    const audioRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const filterMap = {
                'library': '',
                'trending': 'trending',
                'flagged': 'flagged'
            };

            const [tracksData, statsData] = await Promise.all([
                musicService.getSounds({ filter: filterMap[activeTab], search }),
                musicService.getStats() // Optimized: Only fetch stats once or periodically? For now on every tab change is fine but stats don't change by tab. Ideally fetch stats only on mount.
            ]);

            setTracks(tracksData.data || []);
            // Only update stats if we fetched them (we could optimize to fetch stats in a separate useEffect on mount)
            if (activeTab === 'library' || !stats.totalTracks) {
                setStats(statsData.data || {});
            }

        } catch (error) {
            console.error('Failed to fetch music data', error);
            toast.error('Failed to load music data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch stats separately once
        const fetchStats = async () => {
            try {
                const statsData = await musicService.getStats();
                setStats(statsData.data || {});
            } catch (e) {
                console.error(e);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(fetchData, 300);
        return () => clearTimeout(timeout);
    }, [activeTab, search]);

    // Handle Audio Playback
    useEffect(() => {
        if (playing && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Play error", e));
        } else if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [playing]);

    const handlePlay = (track) => {
        if (playing === track.id) {
            setPlaying(null);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0; // Optional: reset
            }
        } else {
            setPlaying(track.id);
            if (audioRef.current) {
                audioRef.current.src = track.file_url;
                audioRef.current.play();
            }
        }
    };

    const handleToggleStatus = async (id, field, value) => {
        try {
            await musicService.toggleStatus(id, { [field]: value });
            // Update local state
            setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
            // Update stats locally for immediate feedback if needed
            toast.success(`Track ${value ? 'marked' : 'unmarked'} successfully`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const formatDuration = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Upload State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadForm, setUploadForm] = useState({ title: '', artist: '' });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setUploadFile(e.target.files[0]);
            // Auto-fill title if empty
            if (!uploadForm.title) {
                setUploadForm(prev => ({ ...prev, title: e.target.files[0].name.replace(/\.[^/.]+$/, "") }));
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        const loadingToast = toast.loading('Uploading sound...');

        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('title', uploadForm.title);
            formData.append('artist', uploadForm.artist);
            // approximate duration or leave 0 to be calculated later if backend supports it
            // For now sending 0 is fine as per controller logic

            await musicService.uploadSound(formData);

            toast.success('Sound uploaded successfully!', { id: loadingToast });
            setShowUploadModal(false);
            setUploadFile(null);
            setUploadForm({ title: '', artist: '' });
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload sound', { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <audio ref={audioRef} onEnded={() => setPlaying(null)} className="hidden" />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <Music className="w-6 h-6 text-pink-500" />
                        Music & Sounds
                    </h1>
                    <p className="text-sm text-slate-500">Manage audio library, trending sounds, and copyright claims.</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    <span>Upload Sound</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tracks', value: formatNumber(stats.totalTracks), icon: Music, color: 'bg-blue-100 text-blue-600' },
                    { label: 'Trending', value: formatNumber(stats.trendingCount), icon: TrendingUp, color: 'bg-green-100 text-green-600' },
                    { label: 'Copyright Flags', value: formatNumber(stats.flaggedCount), icon: AlertCircle, color: 'bg-red-100 text-red-600' },
                    { label: 'Total Uses', value: formatNumber(stats.totalUses), icon: Play, color: 'bg-purple-100 text-purple-600' },
                ].map((stat, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs & Search */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                        {['library', 'trending', 'flagged'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tracks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold w-12">#</th>
                                <th className="px-6 py-4 font-semibold">Track Info</th>
                                <th className="px-6 py-4 font-semibold">Artist</th>
                                <th className="px-6 py-4 font-semibold">Uses</th>
                                <th className="px-6 py-4 font-semibold">Trend</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tracks.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        No tracks found.
                                    </td>
                                </tr>
                            ) : (
                                tracks.map((track) => (
                                    <tr key={track.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-400">{track.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handlePlay(track)}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${playing === track.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600'
                                                        }`}
                                                >
                                                    {playing === track.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                                                </button>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{track.title}</p>
                                                    <p className="text-xs text-slate-500">{formatDuration(track.duration)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{track.artist}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{formatNumber(track.uses_count)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${track.trend_percentage > 0 ? 'bg-green-50 text-green-600' :
                                                track.trend_percentage === 0 ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {track.trend_percentage > 0 ? '+' : ''}{track.trend_percentage}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {track.is_trending && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
                                                        <TrendingUp className="w-3 h-3 mr-1" /> Trending
                                                    </span>
                                                )}
                                                {track.is_flagged && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                                                        <AlertCircle className="w-3 h-3 mr-1" /> Flagged
                                                    </span>
                                                )}
                                                {!track.is_trending && !track.is_flagged && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleToggleStatus(track.id, 'is_trending', !track.is_trending)}
                                                    className={`p-1.5 rounded-lg transition-colors ${track.is_trending ? 'text-purple-600 bg-purple-50' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'}`}
                                                    title={track.is_trending ? "Remove from Trending" : "Mark as Trending"}
                                                >
                                                    <Star className={`w-4 h-4 ${track.is_trending ? 'fill-current' : ''}`} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(track.id, 'is_flagged', !track.is_flagged)}
                                                    className={`p-1.5 rounded-lg transition-colors ${track.is_flagged ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    title={track.is_flagged ? "Unflag" : "Flag"}
                                                >
                                                    <Flag className={`w-4 h-4 ${track.is_flagged ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {/* Simplified pagination logic for UI */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    {/* Just placeholder for now as we don't have full server-side pagination hooked up to UI controls yet in this pass */}
                    <p className="text-sm text-slate-500">Showing <span className="font-medium">{tracks.length}</span> results</p>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-semibold text-slate-800">Upload New Sound</h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Audio File (MP3)</label>
                                <div
                                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    {uploadFile ? (
                                        <p className="text-sm font-medium text-blue-600 truncate px-4">{uploadFile.name}</p>
                                    ) : (
                                        <p className="text-sm text-slate-500">Click to select file</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={uploadForm.title}
                                    onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Artist</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Unknown"
                                    value={uploadForm.artist}
                                    onChange={e => setUploadForm({ ...uploadForm, artist: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploading ? 'Uploading...' : 'Upload Sound'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MusicPage;
