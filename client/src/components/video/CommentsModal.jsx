import React, { useState, useEffect } from 'react';
import { X, Send, User } from 'lucide-react';
import { interactionService } from '../../services/api';

const CommentsModal = ({ videoId, isOpen, onClose }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (isOpen && videoId) {
            fetchComments();
        }
    }, [isOpen, videoId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await interactionService.listComments(videoId);
            if (res.success) {
                setComments(res.data.rows || []);
            }
        } catch (error) {
            console.error('Failed to load comments', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setPosting(true);
        try {
            const res = await interactionService.addComment(videoId, newComment);
            if (res.success) {
                setComments(prev => [res.data, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to post comment', error);
            if (error.response && error.response.status === 401) {
                alert('Please login to comment');
            }
        } finally {
            setPosting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose} />

            <div className="w-full h-[70vh] bg-gray-900 rounded-t-xl overflow-hidden flex flex-col pointer-events-auto relative">

                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900 z-10">
                    <h3 className="text-white font-bold text-sm">{comments.length} comments</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="text-gray-500 text-center text-sm py-4">Loading comments...</div>
                    ) : comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full overflow-hidden">
                                    {comment.user && comment.user.avatar_url ? (
                                        <img src={comment.user.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                                    ) : (
                                        <User className="w-full h-full p-1 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <span className="text-gray-400 text-xs font-bold block mb-1">
                                        @{comment.user ? comment.user.username : 'user'}
                                        <span className="font-normal text-gray-500 ml-2">
                                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ''}
                                        </span>
                                    </span>
                                    <p className="text-white text-sm leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-center text-sm py-10">
                            No comments yet. Be the first to say something!
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-900 border-t border-gray-800">
                    <form onSubmit={handlePost} className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add comment..."
                            className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || posting}
                            className={`p-2 rounded-full ${newComment.trim() ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500'}`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default CommentsModal;
