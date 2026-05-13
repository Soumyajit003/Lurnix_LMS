import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AIRoadmap = () => {
    const { backendUrl, getToken, navigate, currency } = useContext(AppContext);
    const roadmapRef = useRef(null);
    
    const [goal, setGoal] = useState('');
    const [level, setLevel] = useState('Beginner');
    const [studyTime, setStudyTime] = useState('2 hours/day');
    const [learningStyle, setLearningStyle] = useState('Mixed');
    
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [savedRoadmaps, setSavedRoadmaps] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

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

    const downloadPDF = async () => {
        if (!roadmapRef.current) return;
        setIsDownloading(true);
        
        try {
            const element = roadmapRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#05010d', // Match the dark background
                useCORS: true,
                logging: false,
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            // Handle multi-page PDF if needed
            let heightLeft = pdfHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            
            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            
            pdf.save(`${roadmap.title.replace(/\s+/g, '_')}_Roadmap.pdf`);
            toast.success("PDF Downloaded!");
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 px-4 md:px-10 lg:px-20 xl:px-32">
            {/* Hero Section */}
            <div className="text-center py-12 md:py-16 animate-fadeIn">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500">Roadmap Generator</span> with AI
                </h1>
                <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                    Generate personalized step-by-step learning paths powered by AI to achieve your career goals faster.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Form Section */}
                <div className="w-full lg:w-1/3 xl:w-1/4">
                    <div className="bg-[#11081f]/40 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] sticky top-24">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Personalize</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tailor your journey</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div className="group">
                                <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within:text-purple-400">Your Learning Goal</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. android developer" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/10 transition-all placeholder:text-gray-600 shadow-inner"
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-purple-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 ml-1 group-focus-within:text-purple-400">Level</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/10 transition-all appearance-none cursor-pointer shadow-inner pr-10"
                                            value={level}
                                            onChange={(e) => setLevel(e.target.value)}
                                        >
                                            <option className="bg-[#1a0b2e]">Beginner</option>
                                            <option className="bg-[#1a0b2e]">Intermediate</option>
                                            <option className="bg-[#1a0b2e]">Advanced</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-purple-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 ml-1 group-focus-within:text-purple-400">Study Time</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/10 transition-all appearance-none cursor-pointer shadow-inner pr-10"
                                            value={studyTime}
                                            onChange={(e) => setStudyTime(e.target.value)}
                                        >
                                            <option className="bg-[#1a0b2e]">1 hour/day</option>
                                            <option className="bg-[#1a0b2e]">2 hours/day</option>
                                            <option className="bg-[#1a0b2e]">4 hours/day</option>
                                            <option className="bg-[#1a0b2e]">Flexible</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-purple-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 ml-1 group-focus-within:text-purple-400">Learning Style</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/10 transition-all appearance-none cursor-pointer shadow-inner pr-10"
                                        value={learningStyle}
                                        onChange={(e) => setLearningStyle(e.target.value)}
                                    >
                                        <option className="bg-[#1a0b2e]">Mixed</option>
                                        <option className="bg-[#1a0b2e]">Video-based</option>
                                        <option className="bg-[#1a0b2e]">Project-based</option>
                                        <option className="bg-[#1a0b2e]">Reading-based</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-purple-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_auto] hover:bg-right text-white font-bold py-4.5 rounded-2xl transition-all duration-500 shadow-[0_10px_25px_-5px_rgba(147,51,234,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(147,51,234,0.6)] flex items-center justify-center gap-3 relative overflow-hidden group/btn ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Architecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="relative z-10 py-4">Generate Path</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {savedRoadmaps.length > 0 && (
                            <div className="mt-10 border-t border-white/5 pt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-white/50 font-bold text-[10px] uppercase tracking-[0.2em]">History</h3>
                                    <span className="px-2 py-0.5 bg-white/5 rounded-md text-[9px] text-gray-500 border border-white/5 font-bold">{savedRoadmaps.length}</span>
                                </div>
                                <div className="space-y-3 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                                    {savedRoadmaps.map((r, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setRoadmap(r.roadmapData)}
                                            className="p-4 bg-white/5 hover:bg-purple-600/10 border border-white/5 rounded-2xl cursor-pointer transition-all group flex flex-col gap-2 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-xs text-gray-300 line-clamp-1 group-hover:text-purple-400 font-bold transition-colors">{r.roadmapData.title}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                                    <p className="text-[9px] text-gray-500 font-medium">{new Date(r.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                                                    r.level === 'Beginner' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                                    r.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                    {r.level}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Roadmap Display Section */}
                <div className="w-full lg:w-2/3 xl:w-3/4">
                    {loading ? (
                        <div className="space-y-8">
                            <div className="h-20 bg-white/5 rounded-3xl animate-pulse"></div>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white/5 h-80 rounded-[2.5rem] border border-white/10 animate-pulse"></div>
                            ))}
                        </div>
                    ) : roadmap ? (
                        <div className="animate-fadeIn" ref={roadmapRef}>
                            {/* Roadmap Header Card */}
                            <div className="bg-gradient-to-r from-[#1a0b2e] to-[#0f0524] border border-white/10 p-8 md:p-10 rounded-[2.5rem] mb-12 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10"></div>
                                
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-purple-500/30">
                                                AI Generated Path
                                            </span>
                                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/30">
                                                {roadmap.estimatedDuration}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">{roadmap.title}</h2>
                                        <p className="text-gray-400 font-medium">Personalized roadmap for <span className="text-purple-400">{goal}</span> at <span className="text-blue-400">{level}</span> level.</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                        <button 
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-sm font-bold transition-all"
                                        >
                                            {isSaving ? "Saving..." : "💾 Save"}
                                        </button>
                                        <button 
                                            onClick={downloadPDF}
                                            disabled={isDownloading}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl text-white text-sm font-bold shadow-lg shadow-purple-900/20 transition-all"
                                        >
                                            {isDownloading ? "Preparing..." : "📥 Download PDF"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="relative pt-8 pb-20">
                                {/* Vertical Line - Perfectly Centered with Glow */}
                                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 hidden md:block overflow-hidden">
                                    <div className="h-full w-full bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-blue-500/0"></div>
                                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-purple-400 to-transparent animate-pulse"></div>
                                </div>
                                <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500/50 via-blue-500/50 to-transparent md:hidden"></div>

                                <div className="space-y-24 md:space-y-0 relative">
                                    {roadmap.phases.map((phase, idx) => (
                                        <div key={idx} className={`relative flex flex-col md:flex-row items-center justify-between mb-16 md:mb-32 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                            
                                            {/* Dot on Timeline - Perfectly Centered on the Line */}
                                            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-6 h-6 bg-[#05010d] border-4 border-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)] z-30 transition-transform hover:scale-125 duration-300">
                                                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
                                            </div>
                                            
                                            {/* Content Card - Fixed Width for Balance */}
                                            <div className={`w-full md:w-[44%] bg-[#11081f]/40 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[3rem] hover:border-purple-500/40 transition-all duration-700 hover:shadow-[0_30px_70px_rgba(0,0,0,0.6)] group relative overflow-hidden`}>
                                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 blur-[60px] -z-10 group-hover:bg-purple-600/20 transition-all duration-700"></div>
                                                
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-purple-600 to-blue-600 text-white font-black text-xl shadow-[0_10px_20px_-5px_rgba(147,51,234,0.5)] group-hover:scale-110 transition-transform duration-500">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-purple-400 transition-colors leading-tight tracking-tight">{phase.phaseTitle}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                                                <p className="text-purple-400/80 text-xs font-bold uppercase tracking-widest">{phase.duration}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div>
                                                        <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                            <div className="w-4 h-[1px] bg-gray-700"></div> Core Topics
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {phase.topics.map((topic, i) => (
                                                                <span key={i} className="px-4 py-2 bg-white/5 text-gray-300 text-xs rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {phase.projects && phase.projects.length > 0 && (
                                                        <div>
                                                            <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                <div className="w-4 h-[1px] bg-gray-700"></div> Hands-on Build
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {phase.projects.map((project, i) => (
                                                                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                                        <span className="text-sm text-gray-300 font-medium">{project}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="pt-6 border-t border-white/5">
                                                        <div className="flex items-center gap-4 bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10">
                                                            <div className="text-2xl">🏆</div>
                                                            <div>
                                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Phase Milestone</p>
                                                                <p className="text-white text-sm font-semibold">{phase.milestone}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Recommended Courses Integration */}
                                                    {phase.recommendedCourses && phase.recommendedCourses.length > 0 && (
                                                        <div className="pt-6 border-t border-white/5">
                                                            <h4 className="text-purple-400 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-4">Recommended Courses</h4>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {phase.recommendedCourses.map((course, i) => (
                                                                    <div 
                                                                        key={i} 
                                                                        onClick={() => navigate(`/course/${course._id}`)}
                                                                        className="flex items-center gap-4 bg-white/5 p-3.5 rounded-[1.25rem] hover:bg-purple-600/10 cursor-pointer transition-all border border-white/5 hover:border-purple-500/30 group/course"
                                                                    >
                                                                        <div className="relative">
                                                                            <img src={course.courseThumbnail} alt="" className="w-14 h-14 rounded-xl object-cover shadow-lg" />
                                                                            <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover/course:opacity-100 rounded-xl transition-all"></div>
                                                                        </div>
                                                                        <div className="flex-1 overflow-hidden">
                                                                            <p className="text-sm text-white font-bold truncate group-hover/course:text-purple-400 transition-colors">{course.courseTitle}</p>
                                                                            <p className="text-xs text-gray-500 font-medium">{currency}{course.coursePrice}</p>
                                                                        </div>
                                                                        <div className="text-gray-600 group-hover/course:text-purple-400 transition-all pr-1">
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Empty Spacer for desktop alignment */}
                                            <div className="hidden md:block md:w-[45%]"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[70vh] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-[3rem] bg-[#11081f]/40 backdrop-blur-md">
                            <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
                                <span className="text-6xl">🧭</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Start?</h2>
                            <p className="text-gray-400 max-w-sm text-lg leading-relaxed">Fill in your career goals on the left to architect your custom AI-powered learning path.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                    display: block;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.2);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.4);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    );
};

export default AIRoadmap;
