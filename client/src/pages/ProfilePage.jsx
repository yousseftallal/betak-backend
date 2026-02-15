import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { interactionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Heart, MessageCircle, ArrowLeft, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/profile/${username}`);
            if (response.data.success) {
                setProfile(response.data.data);
            }
        } catch (err) {
            console.error('Fetch profile error:', err);
            setError('User not found');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-white">{error}</div>;
    if (!profile) return null;

    const { user, stats } = profile;

    const [following, setFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const { user: currentUser } = useAuth(); // Need to import this

    useEffect(() => {
        if (profile) {
            setFollowersCount(profile.stats.followers);
            checkFollowStatus();
        }
    }, [profile]);

    const checkFollowStatus = async () => {
        try {
            const data = await interactionService.getFollowStatus(username);
            setFollowing(data.data.following);
        } catch (e) {
            // ignore
        }
    };

    const toggleFollow = async () => {
        if (!currentUser) {
            toast.error('Please login to follow');
            window.location.href = '/login';
            return;
        }
        try {
            const newFollowing = !following;
            setFollowing(newFollowing);
            setFollowersCount(prev => newFollowing ? prev + 1 : prev - 1);

            await interactionService.toggleFollow(username);
        } catch (e) {
            setFollowing(!following);
            setFollowersCount(prev => following ? prev + 1 : prev - 1);
        }
    };

    const isOwnProfile = currentUser && currentUser.username === username;

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* ... Header ... */}
            <div className="flex items-center p-4 border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur z-10">
                <button onClick={() => navigate(-1)} className="mr-4 text-white hover:text-gray-300">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold">@{user.username}</h1>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col items-center pt-8 pb-8 px-4">
                <div className="w-24 h-24 bg-gray-800 rounded-full mb-4 overflow-hidden border-2 border-slate-700">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="w-10 h-10 text-gray-500" />
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-bold mb-1">@{user.username}</h2>
                <div className="flex gap-6 mt-4 text-center">
                    <div>
                        <span className="block font-bold text-lg">{stats.following}</span>
                        <span className="text-gray-400 text-sm">Following</span>
                    </div>
                    <div>
                        <span className="block font-bold text-lg">{followersCount}</span>
                        <span className="text-gray-400 text-sm">Followers</span>
                    </div>
                    <div>
                        <span className="block font-bold text-lg">{stats.likes}</span>
                        <span className="text-gray-400 text-sm">Likes</span>
                    </div>
                </div>
                <div className="mt-6 flex gap-2">
                    {isOwnProfile ? (
                        <button className="px-8 py-2 bg-slate-800 text-white font-semibold rounded-md hover:bg-slate-700 transition border border-slate-600">
                            Edit Profile
                        </button>
                    ) : (
                        <button
                            onClick={toggleFollow}
                            className={`px-8 py-2 font-semibold rounded-md transition ${following ? 'bg-slate-800 text-white border border-slate-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
                        >
                            {following ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
                <p className="mt-4 text-center text-gray-300 max-w-sm">{user.bio || 'No bio yet.'}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 mb-1">
                <div className="flex-1 text-center py-3 border-b-2 border-white font-medium cursor-pointer">
                    Videos
                </div>
                <div className="flex-1 text-center py-3 text-gray-500 cursor-pointer hover:text-gray-300">
                    Liked
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-3 gap-1">
                {user.videos && user.videos.length > 0 ? (
                    user.videos.map(video => (
                        <div
                            key={video.id}
                            className="aspect-[3/4] bg-gray-900 relative cursor-pointer group"
                            onClick={() => setSelectedVideo(video)}
                        >
                            {video.thumbnail_url ? (
                                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                            ) : (
                                <video src={video.video_url} className="w-full h-full object-cover muted" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20">
                                <span className="flex items-center gap-1 text-white text-xs font-bold shadow drop-shadow-md">
                                    <Play className="w-4 h-4 fill-white" /> {video.views_count}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-10 text-gray-500">
                        No videos yet
                    </div>
                )}
            </div>

            {/* Video Modal Player */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" onClick={() => setSelectedVideo(null)}>
                    <div className="relative w-full h-full flex items-center justify-center">
                        <video
                            src={selectedVideo.video_url}
                            className="max-h-full max-w-full"
                            controls
                            autoPlay
                            onClick={e => e.stopPropagation()}
                        />
                        <button
                            className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white"
                            onClick={() => setSelectedVideo(null)}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
