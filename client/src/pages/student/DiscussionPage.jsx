import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Footer from '../../components/student/Footer';

const DiscussionPage = () => {
    const { backendUrl } = useContext(AppContext);
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCommunities = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/discussion/communities');
            if (data.success) {
                setCommunities(data.communities);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const seedCommunities = async () => {
        try {
            await axios.get(backendUrl + '/api/discussion/seed');
            fetchCommunities();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading Communities...</div>;
    }

    return (
        <div className="min-h-screen bg-transparent text-white pt-10">
            <div className="px-4 sm:px-10 md:px-14 lg:px-36">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-primary">
                        Lurnix Discussion Hub
                    </h1>
                    <p className="text-gray-400 text-lg">Join a community and start learning together</p>
                    {communities.length === 0 && (
                        <button
                            onClick={seedCommunities}
                            className="mt-6 px-6 py-2 bg-primary rounded-full text-white hover:bg-opacity-80 transition-all"
                        >
                            Initialize Communities
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {communities.map((community) => (
                        <Link
                            key={community._id}
                            to={`/discussion/${community.slug}`}
                            className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/10"
                        >
                            <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                                {community.name}
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                {community.description}
                            </p>
                            <div className="mt-6 flex items-center text-purple-400 font-medium">
                                Enter Community
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DiscussionPage;
