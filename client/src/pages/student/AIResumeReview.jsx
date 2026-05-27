import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AIResumeReview = () => {
    const { backendUrl, getToken, navigate } = useContext(AppContext);
    const reportRef = useRef(null);

    // Form inputs state
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'text'
    const [resumeFile, setResumeFile] = useState(null);
    const [manualResumeText, setManualResumeText] = useState('');
    const [targetJobDescription, setTargetJobDescription] = useState('');
    const [dragActive, setDragActive] = useState(false);

    // Feature status state
    const [loading, setLoading] = useState(false);
    const [review, setReview] = useState(null);
    const [savedReviews, setSavedReviews] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);

    // Fetch history on load
    useEffect(() => {
        fetchSavedReviews();
    }, []);

    const fetchSavedReviews = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/ai/resume-reviews`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setSavedReviews(data.reviews);
            }
        } catch (error) {
            console.error("Error fetching saved reviews:", error);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setResumeFile(file);
                toast.success(`Selected PDF: ${file.name}`);
            } else {
                toast.error("Please upload a PDF file only.");
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                setResumeFile(file);
                toast.success(`Selected PDF: ${file.name}`);
            } else {
                toast.error("Please upload a PDF file only.");
            }
        }
    };

    const handleAudit = async (e) => {
        e.preventDefault();
        if (activeTab === 'upload' && !resumeFile) {
            return toast.error("Please upload a PDF resume file");
        }
        if (activeTab === 'text' && !manualResumeText.trim()) {
            return toast.error("Please paste your resume text");
        }

        setLoading(true);
        setReview(null);
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('targetJobDescription', targetJobDescription);

            if (activeTab === 'upload') {
                formData.append('resume', resumeFile);
            } else {
                formData.append('manualResumeText', manualResumeText);
            }

            const { data } = await axios.post(`${backendUrl}/api/ai/resume-review`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                setReview(data.review);
                toast.success("Resume audited successfully!");
                fetchSavedReviews();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!reportRef.current || !review) return;
        setIsDownloading(true);
        
        try {
            const element = reportRef.current;
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
            
            const sanitizedName = (review.fileName || "Resume_Review").replace(/\s+/g, '_');
            pdf.save(`${sanitizedName}_Audit.pdf`);
            toast.success("Audit Report Downloaded!");
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    // Circle circumference logic for gauge score
    const getVerdict = (score) => {
        if (score >= 90) return { label: 'Outstanding', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
        if (score >= 80) return { label: 'Excellent', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' };
        if (score >= 70) return { label: 'Good Match', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' };
        if (score >= 50) return { label: 'Needs Polish', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
        return { label: 'Substantial Work Needed', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' };
    };

    const scoreVerdict = review ? getVerdict(review.reviewData.score) : null;

    return (
        <div className="min-h-screen pb-20 px-4 md:px-10 lg:px-20 xl:px-32">
            {/* Hero Section */}
            <div className="text-center py-12 md:py-16 animate-fadeIn">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500">AI Resume Review</span> & Tailor
                </h1>
                <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                    Audit your resume using advanced ATS diagnostics, discover keyword gaps, and optimize your qualifications to win interview callbacks.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Form / Sidebar Section */}
                <div className="w-full lg:w-1/3 xl:w-[30%]">
                    <div className="bg-[#11081f]/40 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] sticky top-24">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Optimizer</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Evaluate your profile</p>
                            </div>
                        </div>

                        {/* Input Type Selector Tabs */}
                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'upload' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                📄 Upload PDF
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('text')}
                                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'text' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                📝 Paste Text
                            </button>
                        </div>
                        
                        <form onSubmit={handleAudit} className="space-y-6">
                            {activeTab === 'upload' ? (
                                <div 
                                    className={`relative group border-2 border-dashed rounded-[2rem] p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-purple-400 bg-purple-500/10' : 'border-white/10 hover:border-purple-500/30 bg-white/5 hover:bg-white/10'}`}
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('resume-upload').click()}
                                >
                                    <input 
                                        type="file" 
                                        id="resume-upload" 
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden" 
                                    />
                                    <div className="space-y-3">
                                        <div className="w-12 h-12 bg-white/5 border border-white/5 shadow-inner rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                            <span className="text-2xl">📤</span>
                                        </div>
                                        <div className="text-xs font-bold text-gray-300">
                                            {resumeFile ? (
                                                <span className="text-purple-400 block truncate">{resumeFile.name}</span>
                                            ) : (
                                                "Drag & Drop or Click to Upload PDF"
                                            )}
                                        </div>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Max Size: 5MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="group">
                                    <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within:text-purple-400">Resume Plain Text</label>
                                    <textarea 
                                        rows={6}
                                        placeholder="Paste the full, plain text of your resume here..." 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/10 transition-all placeholder:text-gray-600 shadow-inner resize-none custom-scrollbar"
                                        value={manualResumeText}
                                        onChange={(e) => setManualResumeText(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="group">
                                <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within:text-purple-400">Target Job Description (Optional)</label>
                                <div className="relative">
                                    <textarea 
                                        rows={4}
                                        placeholder="Paste the target job description here to audit keyword alignment and tailor your experience..." 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/10 transition-all placeholder:text-gray-600 shadow-inner resize-none custom-scrollbar"
                                        value={targetJobDescription}
                                        onChange={(e) => setTargetJobDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_auto] hover:bg-right text-white font-bold py-4 rounded-2xl transition-all duration-500 shadow-[0_10px_25px_-5px_rgba(147,51,234,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(147,51,234,0.6)] flex items-center justify-center gap-3 relative overflow-hidden group/btn ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Auditing Profile...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="relative z-10 py-2">Audit Resume</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* History sidebar */}
                        {savedReviews.length > 0 && (
                            <div className="mt-8 border-t border-white/5 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white/50 font-bold text-[10px] uppercase tracking-[0.2em]">Past Audits</h3>
                                    <span className="px-2 py-0.5 bg-white/5 rounded-md text-[9px] text-gray-500 border border-white/5 font-bold">{savedReviews.length}</span>
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {savedReviews.map((r, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setReview(r)}
                                            className={`p-3 bg-white/5 hover:bg-purple-600/10 border rounded-2xl cursor-pointer transition-all group flex flex-col gap-1.5 relative overflow-hidden ${review && review._id === r._id ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5'}`}
                                        >
                                            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-[11px] text-gray-300 line-clamp-1 group-hover:text-purple-400 font-bold transition-colors">{r.fileName}</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[9px] text-gray-500 font-medium">{new Date(r.createdAt).toLocaleDateString()}</p>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border ${
                                                    r.reviewData.score >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                    r.reviewData.score >= 60 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}>
                                                    Score: {r.reviewData.score}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dashboard Results Section */}
                <div className="w-full lg:w-2/3 xl:w-[70%]">
                    {loading ? (
                        <div className="space-y-8 animate-pulse">
                            <div className="bg-white/5 h-64 rounded-[2.5rem] border border-white/10"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/5 h-48 rounded-[2.5rem] border border-white/10"></div>
                                <div className="bg-white/5 h-48 rounded-[2.5rem] border border-white/10"></div>
                            </div>
                            <div className="bg-white/5 h-96 rounded-[2.5rem] border border-white/10"></div>
                        </div>
                    ) : review ? (
                        <div className="animate-fadeIn" ref={reportRef}>
                            {/* Header Overview Card */}
                            <div className="bg-gradient-to-r from-[#1a0b2e] to-[#0f0524] border border-white/10 p-8 md:p-10 rounded-[2.5rem] mb-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10"></div>
                                
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-purple-500/30">
                                                Audit Analysis Completed
                                            </span>
                                            {review.targetJobDescription && (
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/30">
                                                    🎯 Role Tailored
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">Resume Audit: {review.fileName}</h2>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xl">
                                            {review.reviewData.summary}
                                        </p>
                                    </div>
                                    
                                    <div className="w-full md:w-auto flex flex-col items-center gap-3">
                                        {/* CIRCULAR GAUGE FOR SCORE */}
                                        <div className="relative w-28 h-28 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle 
                                                    cx="56" 
                                                    cy="56" 
                                                    r="46" 
                                                    stroke="rgba(255,255,255,0.03)" 
                                                    strokeWidth="8" 
                                                    fill="transparent" 
                                                />
                                                <circle 
                                                    cx="56" 
                                                    cy="56" 
                                                    r="46" 
                                                    stroke="url(#score-gradient)" 
                                                    strokeWidth="8" 
                                                    fill="transparent" 
                                                    strokeDasharray="289"
                                                    strokeDashoffset={289 - (review.reviewData.score / 100) * 289}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                                <defs>
                                                    <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#a855f7" />
                                                        <stop offset="100%" stopColor="#3b82f6" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute flex flex-col items-center justify-center text-center">
                                                <span className="text-3xl font-black text-white">{review.reviewData.score}</span>
                                                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Overall</span>
                                            </div>
                                        </div>
                                        
                                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black border uppercase tracking-wider ${scoreVerdict.color} ${scoreVerdict.border} ${scoreVerdict.bg} shadow-md`}>
                                            {scoreVerdict.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section breakdown metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { title: 'Format & Layout', score: review.reviewData.formattingScore, icon: '📐', color: 'from-blue-500 to-indigo-600 shadow-blue-500/10' },
                                    { title: 'Content & Impact', score: review.reviewData.contentImpactScore, icon: '💥', color: 'from-purple-500 to-pink-600 shadow-purple-500/10' },
                                    { title: 'Language & Style', score: review.reviewData.languageScore, icon: '✍️', color: 'from-amber-500 to-orange-600 shadow-amber-500/10' },
                                    { title: review.targetJobDescription ? 'Tailoring Alignment' : 'General Standards', score: review.reviewData.tailoringScore || 0, icon: '🎯', color: 'from-emerald-500 to-teal-600 shadow-emerald-500/10' }
                                ].map((metric, i) => (
                                    <div key={i} className="bg-[#11081f]/40 backdrop-blur-md border border-white/10 p-5 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
                                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full group-hover:scale-110 transition-transform"></div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xl">{metric.icon}</span>
                                            <span className="text-lg font-black text-white">{metric.score}%</span>
                                        </div>
                                        <div>
                                            <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 leading-tight">{metric.title}</h4>
                                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    className={`bg-gradient-to-r ${metric.color} h-1.5 rounded-full transition-all duration-1000`} 
                                                    style={{ width: `${metric.score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Strengths & Tailoring Keywords Panel */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Strengths */}
                                <div className="bg-[#11081f]/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2.5rem]">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-5 flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">✓</span>
                                        Strengths & Highlights
                                    </h3>
                                    <ul className="space-y-4">
                                        {review.reviewData.strengths.map((str, idx) => (
                                            <li key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-300">
                                                <span className="text-emerald-500 text-sm mt-0.5">✔</span>
                                                <span>{str}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Keywords */}
                                <div className="bg-[#11081f]/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2.5rem] flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-5 flex items-center gap-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 text-xs">⚡</span>
                                            Keyword Alignment Diagnostics
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Matched Key terms
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                                                    {review.reviewData.keywordAnalysis.matchingKeywords.length > 0 ? (
                                                        review.reviewData.keywordAnalysis.matchingKeywords.map((kw, idx) => (
                                                            <span key={idx} className="px-2.5 py-1 bg-emerald-500/5 text-emerald-400 text-[10px] rounded-lg border border-emerald-500/10 font-medium">
                                                                {kw}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-gray-500 italic">No exact matching keywords detected.</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-amber-400 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Missing / ATS Recommended
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                                                    {review.reviewData.keywordAnalysis.missingKeywords.length > 0 ? (
                                                        review.reviewData.keywordAnalysis.missingKeywords.map((kw, idx) => (
                                                            <span key={idx} className="px-2.5 py-1 bg-amber-500/5 text-amber-400 text-[10px] rounded-lg border border-amber-500/10 font-medium">
                                                                {kw}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-gray-500 italic">Excellent keyword coverage! No major gaps detected.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-gray-400 leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/5">
                                        💡 <strong>ATS Recommendation:</strong> {review.reviewData.keywordAnalysis.recommendation}
                                    </div>
                                </div>
                            </div>

                            {/* Section qualitative feedback Accordions */}
                            <div className="bg-[#11081f]/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2.5rem] mb-8">
                                <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-5">Section-by-Section Diagnostics</h3>
                                <div className="space-y-3">
                                    {[
                                        { id: 'summary', name: 'Professional Summary / Objective', content: review.reviewData.sectionFeedback.summary },
                                        { id: 'experience', name: 'Work Experience / Internships', content: review.reviewData.sectionFeedback.experience },
                                        { id: 'projects', name: 'Academic & Personal Projects', content: review.reviewData.sectionFeedback.projects },
                                        { id: 'skills', name: 'Skills Inventory & Tools', content: review.reviewData.sectionFeedback.skills },
                                        { id: 'education', name: 'Education & Credentials', content: review.reviewData.sectionFeedback.education }
                                    ].map((sec) => (
                                        <div key={sec.id} className="border border-white/5 rounded-2xl overflow-hidden bg-white/5 hover:border-purple-500/20 transition-all">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)}
                                                className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-gray-200 hover:text-white"
                                            >
                                                <span>{sec.name}</span>
                                                <span className="text-purple-400 font-extrabold text-sm transition-transform duration-300">
                                                    {expandedSection === sec.id ? '−' : '+'}
                                                </span>
                                            </button>
                                            {expandedSection === sec.id && (
                                                <div className="p-4 pt-0 border-t border-white/5 text-xs text-gray-400 leading-relaxed animate-fadeIn">
                                                    {sec.content}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actionable Key improvements (Before / After examples) */}
                            <div className="bg-[#11081f]/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2.5rem] mb-8">
                                <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-5 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 text-xs">🛠</span>
                                    Recommended Action Plan & Rewrites
                                </h3>
                                <div className="space-y-6">
                                    {review.reviewData.improvements.map((imp, idx) => (
                                        <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded-[2rem] space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                    {imp.category}
                                                </span>
                                                <span className="text-gray-500 text-[10px] font-semibold">Priority Action #{idx + 1}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-white text-sm font-bold mb-1 leading-snug">{imp.issue}</h4>
                                                <p className="text-xs text-gray-400 leading-relaxed">{imp.suggestion}</p>
                                            </div>
                                            
                                            {/* Before After Box */}
                                            {imp.example && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 bg-[#05010d]/50 p-4 rounded-2xl border border-white/5 text-[11px] leading-relaxed">
                                                    <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-white/5 pb-3 md:pb-0 md:pr-3">
                                                        <span className="text-rose-400 font-extrabold uppercase tracking-wider text-[8px] block">⚠️ original version</span>
                                                        <p className="text-gray-500 italic font-medium">{imp.example.split('\n')[0]?.replace(/^Before:\s*/i, '') || "Responsibility-oriented listing."}</p>
                                                    </div>
                                                    <div className="space-y-1.5 pt-3 md:pt-0 md:pl-3">
                                                        <span className="text-emerald-400 font-extrabold uppercase tracking-wider text-[8px] block">✨ polished rewrite</span>
                                                        <p className="text-white font-semibold">{imp.example.split('\n')[1]?.replace(/^After:\s*/i, '') || "Result-oriented metric rewrite."}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Download panel */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReview(null)}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-xs font-bold transition-all"
                                >
                                    🔄 Clear & Re-Audit
                                </button>
                                <button 
                                    onClick={downloadPDF}
                                    disabled={isDownloading}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl text-white text-xs font-bold shadow-lg shadow-purple-900/20 transition-all"
                                >
                                    {isDownloading ? "Preparing PDF..." : "📥 Export Audit Report (PDF)"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[70vh] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-[3rem] bg-[#11081f]/40 backdrop-blur-md">
                            <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
                                <span className="text-6xl">📄</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-white mb-4">Analyze Your Resume</h2>
                            <p className="text-gray-400 max-w-sm text-lg leading-relaxed">
                                Upload your PDF resume or copy-paste your plain text details in the left form to evaluate your score, keywords, and structural polish.
                            </p>
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

export default AIResumeReview;
