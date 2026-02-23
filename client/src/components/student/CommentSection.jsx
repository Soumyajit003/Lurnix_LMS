import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import ConfirmModal from './ConfirmModal';

const CommentSection = ({ postId, initialComments, onCommentAdded }) => {
    const { backendUrl, getToken } = useContext(AppContext);
    const { user } = useUser();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

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

    const handleDeleteComment = async () => {
        if (!commentToDelete) return;
        try {
            const token = await getToken();
            const { data } = await axios.delete(
                `${backendUrl}/api/discussion/comment/${commentToDelete}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success("Comment deleted");
                onCommentAdded();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsModalOpen(false);
            setCommentToDelete(null);
        }
    };

    return (
        <>
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
                    <div key={comment._id} className="bg-white/5 p-5 rounded-xl border border-white/5 group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
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

                            {user && user.id === comment.author._id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCommentToDelete(comment._id);
                                        setIsModalOpen(true);
                                    }}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-md transition-colors"
                                    title="Delete Comment"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {comment.content}
                        </p>
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onConfirm={handleDeleteComment}
                onCancel={() => {
                    setIsModalOpen(false);
                    setCommentToDelete(null);
                }}
            />
        </div>
        </>
    );
};

export default CommentSection;
