import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { videoService } from '../../services/videoService';

export default function UploadVideoModal({ onClose, onSuccess, isUser = false }) {
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [files, setFiles] = useState({ video: null, thumbnail: null });
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!files.video) return alert('Video file is required');

        setUploading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('video', files.video);
            if (files.thumbnail) data.append('thumbnail', files.thumbnail);

            if (isUser) {
                await videoService.uploadUserVideo(data);
            } else {
                await videoService.uploadVideo(data);
            }
            if (onSuccess && typeof onSuccess === 'function') onSuccess();
            onClose();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload video');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">Create Post</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            required
                            placeholder="Give your video a catchy title..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                        <textarea
                            placeholder="What's this video about? #Hashtags"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium resize-none"
                            rows="3"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Media File</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-primary-400 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-600">
                                        {files.video ? files.video.name : "Click to upload Video or Image"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">MP4, JPG, PNG up to 100MB</p>
                                </div>
                                <input type="file" className="hidden" accept="video/*,image/*" onChange={e => handleFileChange(e, 'video')} />
                            </label>
                        </div>
                    </div>

                    {/* Thumbnail optional for simplicity or UI cleaner */}

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full py-4 shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all flex justify-center items-center gap-2 transform active:scale-[0.98]"
                    >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {uploading ? 'Posting...' : 'Post Content'}
                    </button>
                </form>
            </div>
        </div>
    );
}
