import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';

const AIRoadmap = () => {
    const { backendUrl, getToken, navigate, currency } = useContext(AppContext);
    
    const [goal, setGoal] = useState('');
    const [level, setLevel] = useState('Beginner');
    const [studyTime, setStudyTime] = useState('2 hours/day');
    const [learningStyle, setLearningStyle] = useState('Mixed');
    
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [savedRoadmaps, setSavedRoadmaps] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch saved roadmaps on load
    useEffect(() => {
        fetchSavedRoadmaps();
    }, []);

    const fetchSavedRoadmaps = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/ai/roadmap/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setSavedRoadmaps(data.roadmaps);
            }
        } catch (error) {
            console.error("Error fetching saved roadmaps:", error);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!goal) return toast.error("Please enter your learning goal");

        setLoading(true);
        setRoadmap(null);
        try {
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/ai/roadmap`, 
                { goal, level, studyTime, learningStyle },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setRoadmap(data.roadmap);
                toast.success("Roadmap generated successfully!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!roadmap) return;
        setIsSaving(true);
        try {
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/ai/roadmap/save`,
                { goal, level, studyTime, learningStyle, roadmapData: roadmap },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success("Roadmap saved!");
                fetchSavedRoadmaps();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 px-4 md:px-20 lg:px-32">
            {/* Hero Section */}
            <div className="text-center py-16 animate-fadeIn">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    🚀 AI Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Roadmap Generator</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Generate personalized step-by-step learning paths powered by AI to achieve your career goals faster.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl sticky top-24">
                        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="p-2 bg-purple-500/20 rounded-lg">🎯</span> Customize Your Path
                        </h2>
                        
                        <form onSubmit={handleGenerate} className="space-y-5">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">What do you want to learn?</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Become MERN Stack Developer" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Current Level</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all appearance-none"
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                    >
                                        <option className="bg-[#1a0b2e]">Beginner</option>
                                        <option className="bg-[#1a0b2e]">Intermediate</option>
                                        <option className="bg-[#1a0b2e]">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Study Time</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all appearance-none"
                                        value={studyTime}
                                        onChange={(e) => setStudyTime(e.target.value)}
                                    >
                                        <option className="bg-[#1a0b2e]">1 hour/day</option>
                                        <option className="bg-[#1a0b2e]">2 hours/day</option>
                                        <option className="bg-[#1a0b2e]">4 hours/day</option>
                                        <option className="bg-[#1a0b2e]">Flexible</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Learning Style</label>
                                <select 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all appearance-none"
                                    value={learningStyle}
                                    onChange={(e) => setLearningStyle(e.target.value)}
                                >
                                    <option className="bg-[#1a0b2e]">Mixed</option>
                                    <option className="bg-[#1a0b2e]">Video-based</option>
                                    <option className="bg-[#1a0b2e]">Project-based</option>
                                    <option className="bg-[#1a0b2e]">Reading-based</option>
                                </select>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>✨ Generate Roadmap</>
                                )}
                            </button>
                        </form>

                        {savedRoadmaps.length > 0 && (
                            <div className="mt-10 border-t border-white/10 pt-6">
                                <h3 className="text-white font-medium mb-4">Your Saved Roadmaps</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {savedRoadmaps.map((r, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setRoadmap(r.roadmapData)}
                                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-colors group"
                                        >
                                            <p className="text-sm text-gray-300 line-clamp-1 group-hover:text-purple-400">{r.roadmapData.title}</p>
                                            <p className="text-[10px] text-gray-500 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Roadmap Display Section */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="space-y-8 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white/5 h-64 rounded-3xl border border-white/10"></div>
                            ))}
                        </div>
                    ) : roadmap ? (
                        <div className="space-y-12 relative animate-fadeIn">
                            {/* Vertical Line */}
                            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-blue-500/50 to-purple-500/50 hidden md:block"></div>

                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{roadmap.title}</h2>
                                    <p className="text-purple-400 mt-1">Estimated Duration: {roadmap.estimatedDuration}</p>
                                </div>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white text-sm transition-all"
                                >
                                    {isSaving ? "Saving..." : "💾 Save Roadmap"}
                                </button>
                            </div>

                            <div className="space-y-16">
                                {roadmap.phases.map((phase, idx) => (
                                    <div key={idx} className={`relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                        {/* Dot on Timeline */}
                                        <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] z-10 hidden md:block"></div>
                                        
                                        {/* Content Card */}
                                        <div className="w-full md:w-[45%] bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-purple-500/50 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] group">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{phase.phaseTitle}</h3>
                                                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                                                    {phase.duration}
                                                </span>
                                            </div>

                                            <div className="mb-6">
                                                <p className="text-gray-400 text-sm mb-3 font-medium">What you'll learn:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {phase.topics.map((topic, i) => (
                                                        <span key={i} className="px-3 py-1 bg-white/5 text-gray-300 text-xs rounded-lg border border-white/5">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {phase.projects && phase.projects.length > 0 && (
                                                <div className="mb-6">
                                                    <p className="text-gray-400 text-sm mb-3 font-medium">Hands-on Projects:</p>
                                                    <ul className="space-y-2">
                                                        {phase.projects.map((project, i) => (
                                                            <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                                {project}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="mt-6 pt-6 border-t border-white/10">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-yellow-500">🏆</span>
                                                    <span className="text-gray-400">Milestone:</span>
                                                    <span className="text-white font-medium">{phase.milestone}</span>
                                                </div>
                                            </div>

                                            {/* Recommended Courses Integration */}
                                            {phase.recommendedCourses && phase.recommendedCourses.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-white/10">
                                                    <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">Recommended Courses</p>
                                                    <div className="space-y-4">
                                                        {phase.recommendedCourses.map((course, i) => (
                                                            <div 
                                                                key={i} 
                                                                onClick={() => navigate(`/course/${course._id}`)}
                                                                className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl hover:bg-white/10 cursor-pointer transition-all border border-white/5"
                                                            >
                                                                <img src={course.courseThumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                                <div>
                                                                    <p className="text-sm text-white font-medium line-clamp-1">{course.courseTitle}</p>
                                                                    <p className="text-xs text-gray-500">{currency}{course.coursePrice}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Empty Spacer for desktop alignment */}
                                        <div className="hidden md:block md:w-[45%]"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                            <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                                <span className="text-5xl">🧭</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">No Roadmap Generated</h2>
                            <p className="text-gray-400 max-w-sm">Fill in the form to generate your custom AI-powered learning roadmap.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    display: block;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.5);
                }
            `}} />
        </div>
    );
};

export default AIRoadmap;
