import React from 'react';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ featureName }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                <img
                    src={assets.logo}
                    alt="Lurnix Logo"
                    className="w-32 md:w-40 relative z-10 mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
                    onClick={() => navigate('/')}
                />
            </div>

            <div className="space-y-4 animate-fadeIn">
                <h2 className="text-primary font-medium tracking-widest uppercase text-sm md:text-base">
                    Exciting things are on the way
                </h2>
                <h1 className="text-4xl md:text-6xl font-bold text-white max-w-2xl mx-auto leading-tight">
                    {featureName || 'AI Feature'} <span className="text-gray-500 text-3xl md:text-5xl">is</span> <br />
                    <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Coming Soon</span>
                </h1>
                <p className="text-gray-400 max-w-lg mx-auto text-lg">
                    We're working hard to bring you the best AI-powered tools to accelerate your learning journey.
                </p>
            </div>

            <div className="mt-12 flex flex-col md:flex-row gap-4 items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 rounded-full border border-white/10 text-gray-300 hover:bg-white/5 transition-all font-medium"
                >
                    Go Back
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20"
                >
                    Back to Home
                </button>
            </div>

            <div className="mt-20 flex gap-8 items-center justify-center">
                <div className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        <span className="text-xl">🚀</span>
                    </div>
                    <span className="text-gray-500 text-xs font-medium">Faster</span>
                </div>
                <div className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        <span className="text-xl">🧠</span>
                    </div>
                    <span className="text-gray-500 text-xs font-medium">Smarter</span>
                </div>
                <div className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        <span className="text-xl">⚡</span>
                    </div>
                    <span className="text-gray-500 text-xs font-medium">Better</span>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
