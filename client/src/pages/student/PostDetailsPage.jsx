import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import moment from 'moment';
import CommentSection from '../../components/student/CommentSection';

const PostDetailsPage = () => {
    const { postId } = useParams();
    const { backendUrl } = useContext(AppContext);
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPostDetails = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/discussion/post/${postId}`);
            if (data.success) {
                setPost(data.post);
                setComments(data.comments);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostDetails();
    }, [postId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading Post...</div>;
    }

    if (!post) {
        return <div className="min-h-screen flex items-center justify-center text-white">Post not found</div>;
    }

    return (
        <div className="min-h-screen bg-transparent text-white pt-10 pb-20">
            <div className="px-4 sm:px-10 md:px-14 lg:px-36">

                <Link
                    to={`/discussion/${post.community.slug}`}
                    className="text-purple-400 hover:text-purple-300 mb-6 inline-block flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to {post.community.name}
                </Link>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 mb-10 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <img
                            src={post.author.imageUrl}
                            alt={post.author.name}
                            className="w-12 h-12 rounded-full border border-white/10"
                        />
                        <div>
                            <h2 className="text-xl font-bold">{post.author.name}</h2>
                            <p className="text-sm text-gray-500">{moment(post.createdAt).fromNow()}</p>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">
                        {post.title}
                    </h1>

                    <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap mb-8">
                        {post.content}
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <CommentSection
                            postId={post._id}
                            initialComments={comments}
                            onCommentAdded={fetchPostDetails}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailsPage;
