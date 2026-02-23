import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { AppContext } from '../../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';

const PostCard = ({ post, onDelete }) => {
    const { backendUrl, getToken } = useContext(AppContext);
    const { user } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.delete(
                `${backendUrl}/api/discussion/post/${post._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success("Post deleted");
                if (onDelete) onDelete();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <Link
                to={`/discussion/post/${post._id}`}
                className="block bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 relative group"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={post.author.imageUrl}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full border border-white/10"
                        />
                        <div>
                            <h4 className="text-white font-medium">{post.author.name}</h4>
                            <p className="text-xs text-gray-500">{moment(post.createdAt).fromNow()}</p>
                        </div>
                    </div>

                    {user && user.id === post.author._id && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsModalOpen(true);
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-md transition-colors"
                            title="Delete Post"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>

                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">
                    {post.title}
                </h3>

                <p className="text-gray-400 line-clamp-2 mb-4">
                    {post.content}
                </p>

                <div className="flex items-center text-gray-400 text-sm gap-4">
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.commentsCount} Comments
                    </div>
                </div>
            </Link>

            <ConfirmModal
                isOpen={isModalOpen}
                onConfirm={handleDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default PostCard;
