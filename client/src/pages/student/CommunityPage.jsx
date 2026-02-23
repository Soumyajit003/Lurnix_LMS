import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import PostCard from '../../components/student/PostCard';
import CreatePostModal from '../../components/student/CreatePostModal';

const CommunityPage = () => {
    const { slug } = useParams();
    const { backendUrl } = useContext(AppContext);
    const { user } = useUser();
    const [posts, setPosts] = useState([]);
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/discussion/${slug}/posts`);
            if (data.success) {
                setPosts(data.posts);
                setCommunity(data.community);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [slug]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (!community) {
        return <div className="min-h-screen flex items-center justify-center text-white">Community not found</div>;
    }

    return (
        <div className="min-h-screen bg-transparent text-white pt-10 pb-20">
            <div className="px-4 sm:px-10 md:px-14 lg:px-36">

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <Link to="/discussion" className="text-purple-400 hover:text-purple-300 mb-4 inline-block flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Hub
                        </Link>
                        <h1 className="text-4xl font-bold">{community.name}</h1>
                        <p className="text-gray-400 mt-2">{community.description}</p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-white px-8 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg"
                        >
                            Create New Post
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-6 mb-20">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                            <p className="text-gray-400 text-lg">No discussions yet in this community. Be the first to start one!</p>
                        </div>
                    )}
                </div>

                <CreatePostModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    communityId={community._id}
                    onPostCreated={fetchPosts}
                />
            </div>
        </div>
    );
};

export default CommunityPage;
