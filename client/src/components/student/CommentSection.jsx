import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const CommentSection = ({ postId, initialComments, onCommentAdded }) => {
    const { backendUrl, getToken } = useContext(AppContext);
    const { user } = useUser();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);

        try {
            const token = await getToken();
            const { data } = await axios.post(
                `${backendUrl}/api/discussion/comment`,
                { content, postId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success("Comment added!");
                setContent('');
                onCommentAdded();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                Comments
                <span className="text-gray-500 text-lg font-normal">({initialComments.length})</span>
            </h3>

            {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-12">
                    <div className="relative">
                        <textarea
                            required
                            rows="3"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all resize-none"
                            placeholder="Add a comment..."
                        ></textarea>
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="absolute bottom-3 right-3 bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                        >
                            {loading ? '...' : 'Post'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center mb-12">
                    <p className="text-gray-400">Please log in to participate in the discussion.</p>
                </div>
            )}

            <div className="flex flex-col gap-6">
                {initialComments.map((comment) => (
                    <div key={comment._id} className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={comment.author.imageUrl}
                                alt={comment.author.name}
                                className="w-8 h-8 rounded-full border border-white/10"
                            />
                            <div>
                                <h4 className="text-white text-sm font-semibold">{comment.author.name}</h4>
                                <p className="text-[10px] text-gray-500">{moment(comment.createdAt).fromNow()}</p>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {comment.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
