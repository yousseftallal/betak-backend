import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Music2, User } from 'lucide-react';
import axios from 'axios';
import { interactionService } from '../services/api';
import CommentsModal from '../components/video/CommentsModal';
import UploadVideoModal from '../components/video/UploadVideoModal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const VideoCard = ({ video, isActive }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(video.likes_count || 0);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        checkLikeStatus();
    }, [video.id]);

    const checkLikeStatus = async () => {
        try {
            const data = await interactionService.getLikeStatus(video.id);
            setLiked(data.data.liked);
        } catch (e) {
            // ignore
        }
    };

    const toggleLike = async () => {
        try {
            const newLiked = !liked;
            setLiked(newLiked);
            setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
            await interactionService.toggleLike(video.id);
        } catch (e) {
            setLiked(!liked);
            setLikesCount(prev => liked ? prev + 1 : prev - 1);
            if (e.response && e.response.status === 401) {
                toast.error('Please login to like videos');
                window.location.href = '/login';
            }
        }
    };

    // Auto play/pause based on active state
    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(e => console.log('Autoplay blocked:', e));
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (isPlaying) {
            videoRef.current?.pause();
        } else {
            videoRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="relative h-screen w-full bg-black flex items-center justify-center snap-start">
            {/* Content Player */}
            <div className={`absolute inset-0 bg-black ${video.type === 'image' ? 'flex items-center justify-center' : ''}`} onClick={togglePlay}>
                {video.type === 'image' ? (
                    <img
                        src={video.video_url}
                        className="w-full h-full object-contain"
                        alt={video.description}
                    />
                ) : (
                    <video
                        ref={videoRef}
                        className="h-full w-full object-cover"
                        src={video.video_url}
                        loop
                        playsInline
                        muted={true}
                    />
                )}
            </div>

            {/* Right Sidebar (Interactions) */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10">

                {/* User Avatar */}
                <div
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/@${video.user?.username}`;
                    }}
                >
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border-2 border-white overflow-hidden transition-transform transform group-hover:scale-110">
                        {video.user?.avatar_url ? (
                            <img src={video.user.avatar_url} alt={video.user.username} className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-white w-6 h-6" />
                        )}
                    </div>
                </div>

                {/* Like Button */}
                <div
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleLike();
                    }}
                >
                    <div className="p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors">
                        <Heart
                            className={`w-8 h-8 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-white fill-white/10 hover:fill-red-500 hover:text-red-500'}`}
                        />
                    </div>
                    <span className="text-white text-xs font-semibold">{likesCount}</span>
                </div>

                {/* Comment Button */}
                <div
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowComments(true);
                    }}
                >
                    <div className="p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors">
                        <MessageCircle className="w-8 h-8 text-white fill-white/10 hover:fill-white/30 transition-colors" />
                    </div>
                    <span className="text-white text-xs font-semibold">{video.comments_count}</span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                    <div className="p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors">
                        <Share2 className="w-8 h-8 text-white fill-white/10 hover:fill-white/30 transition-colors" />
                    </div>
                    <span className="text-white text-xs font-semibold">{video.shares_count}</span>
                </div>
            </div>

            {/* Comments Modal */}
            <CommentsModal
                videoId={video.id}
                isOpen={showComments}
                onClose={() => setShowComments(false)}
            />

            {/* Bottom Content (Info) */}
            <div className="absolute left-4 bottom-8 z-10 max-w-[80%]">
                <h3
                    className="text-white font-bold text-lg mb-2 cursor-pointer hover:underline"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/@${video.user?.username}`;
                    }}
                >
                    @{video.user?.username || 'unknown'}
                </h3>
                <p className="text-white text-sm mb-4 line-clamp-2">{video.description}</p>
                <div className="flex items-center gap-2 text-white/90">
                    <Music2 className="w-4 h-4 animate-spin-slow" />
                    <span className="text-sm font-medium">Original Sound</span>
                </div>
            </div>
        </div>
    );
};

const UserHome = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const response = await axios.get('/api/v1/feed');
            if (response.data.success) {
                setVideos(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch feed:', error);
            toast.error('Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (e) => {
        const index = Math.round(e.target.scrollTop / e.target.clientHeight);
        setActiveIndex(index);
    };

    const handleUploadClick = () => {
        if (!user) {
            toast.error('Please login to upload videos');
            window.location.href = '/login';
            return;
        }
        setShowUploadModal(true);
    };

    if (loading) {
        return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div
            className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar"
            onScroll={handleScroll}
        >
            {/* Simple Top Nav */}
            <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                {/* Logo/Brand for Mobile */}
                <div className="pointer-events-auto">
                    <span className="font-extrabold text-white tracking-tight text-lg drop-shadow-md">BeTak</span>
                </div>

                {/* Center Tabs */}
                <div className="flex gap-6 pointer-events-auto absolute left-1/2 transform -translate-x-1/2">
                    <span className="text-white/70 font-semibold cursor-pointer hover:text-white transition-colors text-base drop-shadow-sm">Following</span>
                    <span className="text-white font-bold cursor-pointer border-b-2 border-white pb-1 drop-shadow-sm">For You</span>
                </div>

                {/* Right Side Buttons */}
                <div className="pointer-events-auto flex items-center gap-3">
                    <button
                        onClick={handleUploadClick}
                        className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
                        title="Upload Video"
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    {user ? (
                        <div
                            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-white/20 hover:border-white transition-colors"
                            onClick={() => window.location.href = `/@${user.username}`}
                        >
                            {user.avatar_url ? (
                                <img src={user.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">{user.username.substring(0, 2).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="/login" className="px-5 py-2 bg-primary-600 text-white text-sm font-bold rounded-full hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20">
                            Log In
                        </a>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadVideoModal
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        fetchFeed(); // Refresh feed to show new video? Maybe not optimal but okay
                    }}
                    isUser={true}
                />
            )}

            {videos.length > 0 ? (
                videos.map((video, index) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        isActive={index === activeIndex}
                    />
                ))
            ) : (
                <div className="h-screen flex items-center justify-center text-gray-500">
                    No videos available
                </div>
            )}
        </div>
    );
};

export default UserHome;
