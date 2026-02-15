import { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import VideoFilters from '../components/ui/VideoFilters'; // Import new component
import { Play, Eye, ThumbsUp, MessageCircle, MoreVertical, Trash2, EyeOff, Star, Plus } from 'lucide-react';
import UploadVideoModal from '../components/video/UploadVideoModal';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

import useDebounce from '../hooks/useDebounce';

export default function VideosPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [searchParams] = useSearchParams();
    const [selectedVideo, setSelectedVideo] = useState(null); // For modal player
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            // Convert searchParams to object
            const params = Object.fromEntries(searchParams);

            const data = await videoService.getVideos({
                page: pagination.page,
                limit: pagination.limit,
                ...params // Spread all params: search, status, category, is_featured, date_from, date_to
            });

            setVideos(data.data.rows);
            setPagination(prev => ({ ...prev, total: data.data.count })); // Backend returns 'count' now

        } catch (error) {
            console.error('Failed to fetch videos:', error);
            toast.error('Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [pagination.page, searchParams]); // Refetch on URL params change

    // Actions
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this video?')) return;
        try {
            await videoService.deleteVideo(id);
            toast.success('Video deleted successfully');
            fetchVideos();
        } catch (error) {
            toast.error('Failed to delete video');
        }
    };

    const handleHide = async (id) => {
        try {
            await videoService.hideVideo(id);
            toast.success('Video status updated');
            fetchVideos();
        } catch (error) {
            toast.error('Failed to update video status');
        }
    }

    const handleFeature = async (id) => {
        try {
            await videoService.featureVideo(id);
            toast.success('Video feature status updated');
            fetchVideos();
        } catch (error) {
            toast.error('Failed to update feature status');
        }
    }

    const columns = [
        {
            header: 'Video',
            accessor: 'title',
            render: (video) => (
                <div className="flex items-start gap-3 min-w-[250px]">
                    <div className="relative w-24 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                        {video.thumbnail_url ? (
                            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600"><Play className="w-6 h-6" /></div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] text-white px-1 rounded">
                            {video.duration || '0:00'}
                        </span>
                        <span className="absolute top-1 left-1 bg-black/70 text-[10px] text-slate-300 px-1 rounded font-mono">
                            #{video.id}
                        </span>
                        {video.is_features || video.is_featured ? (
                            <span className="absolute top-1 right-1 text-yellow-400">
                                <Star className="w-3 h-3 fill-yellow-400" />
                            </span>
                        ) : null}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 line-clamp-1" title={video.title}>{video.title || 'Untitled Video'}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{video.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-1">
                            {/* Updated category badge */}
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase tracking-wider">
                                {video.category || 'GEN'}
                            </span>
                            {(video.User || video.user) && (
                                <span className="text-xs text-blue-600">@{(video.User?.username || video.user?.username)}</span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (video) => <StatusBadge status={video.status} />
        },
        {
            header: 'Metrics',
            accessor: 'metrics',
            render: (video) => (
                <div className="flex gap-3 text-slate-500 text-xs">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.views_count?.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {video.likes_count?.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {video.comments_count?.toLocaleString()}</span>
                </div>
            )
        },
        {
            header: 'Reports',
            accessor: 'reports_count',
            render: (video) => (
                video.reports_count > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                        {video.reports_count} Reports
                    </span>
                ) : (
                    <span className="text-slate-400 text-xs">-</span>
                )
            )
        },
        {
            header: 'AI Analysis',
            accessor: 'id', // Mocking based on ID
            render: (video) => {
                // Mock Score logic
                const safeScore = (video.id * 7) % 100;
                const isSafe = safeScore > 30; // 70% chance of being safe for demo

                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isSafe ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isSafe ? 'Safe' : 'Flagged'}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                                {isSafe ? `${80 + (video.id % 20)}%` : `${85 + (video.id % 15)}%`}
                            </span>
                        </div>
                        {!isSafe && (
                            <span className="text-[10px] text-rose-400">Potential Nudity</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Posted',
            accessor: 'created_at',
            render: (video) => new Date(video.created_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (video) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(video.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleHide(video.id)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-colors" title="Hide/Unhide">
                        <EyeOff className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleFeature(video.id)}
                        className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${video.is_featured ? 'text-yellow-500' : 'text-slate-400 hover:text-yellow-500'}`}
                        title={video.is_featured ? "Unfeature" : "Feature"}
                    >
                        <Star className={`w-4 h-4 ${video.is_featured ? 'fill-yellow-500' : ''}`} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Videos Management</h1>
                <p className="text-slate-500">Moderate and manage platform content.</p>
            </div>

            <VideoFilters
                onFilterChange={() => setPagination(prev => ({ ...prev, page: 1 }))}
                onReset={() => setPagination(prev => ({ ...prev, page: 1 }))}
            />

            <DataTable
                columns={columns}
                data={videos}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />

            {/* Video Player Modal */}
            {
                selectedVideo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="relative aspect-video bg-black">
                                {/* In a real app, use a video player component here */}
                                <video
                                    src={selectedVideo.video_url}
                                    poster={selectedVideo.thumbnail_url}
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="p-6 bg-slate-900">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h3>
                                        <p className="text-slate-400 text-sm">{selectedVideo.description}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedVideo(null)}
                                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showUploadModal && (
                    <UploadVideoModal
                        onClose={() => setShowUploadModal(false)}
                        onSuccess={fetchVideos}
                    />
                )
            }
        </div >
    );
}
