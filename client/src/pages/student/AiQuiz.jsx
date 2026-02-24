import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { useParams, useLocation } from 'react-router-dom';

const AiQuiz = () => {
    const { backendUrl, getToken, navigate } = useContext(AppContext);
    const { quizId } = useParams();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'history'
    const [quizState, setQuizState] = useState('config'); // 'config', 'loading', 'active', 'result'

    // Config State
    const [topics, setTopics] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState(10);

    // Quiz State
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);

    // Result State
    const [quizResult, setQuizResult] = useState(null);

    // History State
    const [quizHistory, setQuizHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Initial Route Handling
    useEffect(() => {
        if (quizId) {
            if (location.pathname.includes('/ai-quiz/view/')) {
                fetchQuizDetails(quizId);
            } else if (location.pathname.includes('/ai-quiz/take/')) {
                fetchQuizForTaking(quizId);
            }
        } else {
            // Reset state when navigating back to main quiz page
            setQuizState('config');
            setCurrentQuiz(null);
            setQuizResult(null);
            setUserAnswers([]);
        }
    }, [quizId, location.pathname]);

    const fetchQuizDetails = async (id) => {
        setQuizState('loading');
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/ai/quiz/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setCurrentQuiz(data.quiz);
                setQuizResult({
                    score: data.quiz.score,
                    correctCount: data.quiz.correctCount,
                    feedback: data.quiz.feedback
                });
                setUserAnswers(data.quiz.userAnswers);
                setQuizState('result');
                setActiveTab('generate');
            } else {
                toast.error(data.message);
                navigate('/ai-quiz');
            }
        } catch (error) {
            toast.error(error.message);
            navigate('/ai-quiz');
        }
    };

    const fetchQuizForTaking = async (id) => {
        setQuizState('loading');
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/ai/quiz/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                if (data.quiz.score > 0 || data.quiz.userAnswers.length > 0) {
                    toast.info("This quiz was already submitted.");
                    return navigate(`/ai-quiz/view/${id}`);
                }
                setCurrentQuiz(data.quiz);
                setUserAnswers(new Array(data.quiz.questions.length).fill(''));
                setTimeLeft(data.quiz.numberOfQuestions * 60);
                setQuizState('active');
                setActiveTab('generate');
                startTimer(data.quiz.numberOfQuestions * 60);
            } else {
                toast.error(data.message);
                navigate('/ai-quiz');
            }
        } catch (error) {
            toast.error(error.message);
            navigate('/ai-quiz');
        }
    };

    // Fetch History
    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/ai/user-quizzes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setQuizHistory(data.quizzes);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    // Handle Quiz Generation
    const generateQuiz = async () => {
        if (!topics.trim()) {
            return toast.error("Please enter at least one topic");
        }
        setQuizState('loading');
        try {
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/ai/generate-quiz`,
                { topics, difficulty, numberOfQuestions: numQuestions },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                navigate(`/ai-quiz/take/${data.quiz._id}`);
            } else {
                toast.error(data.message);
                setQuizState('config');
            }
        } catch (error) {
            toast.error(error.message);
            setQuizState('config');
        }
    };

    const startTimer = (seconds) => {
        if (timerInterval) clearInterval(timerInterval);
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    submitQuiz(true); // Auto-submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setTimerInterval(interval);
    };

    useEffect(() => {
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [timerInterval]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleAnswer = (questionIndex, option) => {
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = option;
        setUserAnswers(newAnswers);
    };

    const submitQuiz = async (isAuto = false) => {
        if (timerInterval) clearInterval(timerInterval);

        if (!isAuto && userAnswers.includes('')) {
            if (!window.confirm("You have some unanswered questions. Do you still want to submit?")) {
                startTimer(timeLeft);
                return;
            }
        }

        setQuizState('loading');
        try {
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/ai/submit-quiz`,
                { quizId: currentQuiz._id, userAnswers },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setQuizResult(data);
                setQuizState('result');
                if (isAuto) toast.info("Time is up! Quiz submitted automatically.");
                navigate(`/ai-quiz/view/${currentQuiz._id}`);
            } else {
                toast.error(data.message);
                setQuizState('active');
                startTimer(timeLeft);
            }
        } catch (error) {
            toast.error(error.message);
            setQuizState('active');
            startTimer(timeLeft);
        }
    };

    // Custom Dropdown State
    const [isDiffOpen, setIsDiffOpen] = useState(false);
    const [isNumOpen, setIsNumOpen] = useState(false);
    const diffRef = useRef(null);
    const numRef = useRef(null);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (diffRef.current && !diffRef.current.contains(event.target)) setIsDiffOpen(false);
            if (numRef.current && !numRef.current.contains(event.target)) setIsNumOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const CustomSelect = ({ label, value, options, onChange, isOpen, setIsOpen, containerRef }) => (
        <div className="relative" ref={containerRef}>
            <label className="block text-gray-400 text-[10px] uppercase font-black tracking-widest mb-3 px-1">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full bg-white/5 backdrop-blur-xl border rounded-xl px-4 py-3.5 
                    text-white flex items-center justify-between cursor-pointer transition-all duration-300
                    ${isOpen ? 'border-purple-500 shadow-lg shadow-purple-500/10' : 'border-white/10 hover:border-purple-400/40'}
                `}
            >
                <span className="font-bold text-sm">{typeof value === 'number' ? `${value} Questions` : value}</span>
                <svg
                    className={`w-4 h-4 text-purple-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0f081d]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`
                                px-4 py-3 text-sm font-bold cursor-pointer transition-colors
                                ${value === opt.value ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderConfig = () => (
        <div className="max-w-2xl mx-auto p-8 sm:p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative group">
            {/* Background Blurs - Contained separately so they don't clip dropdowns */}
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden -z-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 blur-[80px]"></div>
            </div>

            <div className="flex flex-col items-center mb-10">
                <h2 className="text-3xl font-bold text-white text-center">Generate AI Quiz</h2>
            </div>
            <div className="space-y-8">
                <div>
                    <label className="block text-gray-400 text-[10px] uppercase font-black tracking-widest mb-3 px-1">Topic(s)  </label>
                    <input
                        type="text"
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        placeholder="e.g. Quantum Physics, React Architecture..."
                        className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:bg-white/[0.08] transition-all duration-300 font-bold"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <CustomSelect
                        label="Difficulty"
                        value={difficulty}
                        options={[
                            { label: 'Easy', value: 'Easy' },
                            { label: 'Medium', value: 'Medium' },
                            { label: 'Hard', value: 'Hard' }
                        ]}
                        onChange={setDifficulty}
                        isOpen={isDiffOpen}
                        setIsOpen={setIsDiffOpen}
                        containerRef={diffRef}
                    />
                    <CustomSelect
                        label="Questions"
                        value={numQuestions}
                        options={[
                            { label: '10 Questions', value: 10 },
                            { label: '15 Questions', value: 15 },
                            { label: '20 Questions', value: 20 }
                        ]}
                        onChange={setNumQuestions}
                        isOpen={isNumOpen}
                        setIsOpen={setIsNumOpen}
                        containerRef={numRef}
                    />
                </div>

                <button
                    onClick={generateQuiz}
                    className="w-full bg-gradient-to-r from-purple-600 to-[#3324ad] hover:scale-[1.02] active:scale-[0.98] text-white font-black py-3 rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(147,51,234,0.3)] tracking-widest text-lg mt-4 overflow-hidden relative group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    Start Quiz
                </button>
            </div>
        </div>
    );

    const renderActiveQuiz = () => (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center -mx-4 sm:mx-0 sm:rounded-b-2xl mb-8">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm hidden sm:inline">Remaining:</span>
                    <span className={`font-mono text-xl sm:text-2xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
                <div className="text-white font-semibold text-sm sm:text-base">
                    AI QUIZ ATTEMPT
                </div>
                <button
                    onClick={() => submitQuiz(false)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 sm:px-8 py-2 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 active:scale-95 text-sm sm:text-base"
                >
                    Finish & Submit
                </button>
            </div>

            <div className="space-y-12">
                {currentQuiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-2xl transition-all hover:bg-white/[0.08] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-purple-600/20 group-hover:bg-purple-600 transition-all"></div>
                        <div className="flex justify-between items-start mb-8 gap-6">
                            <div className="space-y-2 flex-1">
                                <div className="text-purple-400 font-black text-xs uppercase tracking-[0.3em]">Question {qIndex + 1}</div>
                                <h3 className="text-xl sm:text-2xl text-white font-bold leading-tight">
                                    {q.question}
                                </h3>
                            </div>
                            <span className="px-4 py-1.5 bg-white/5 text-gray-400 text-[10px] sm:text-xs rounded-full border border-white/10 whitespace-nowrap uppercase tracking-widest font-black shrink-0">
                                {q.topic}
                            </span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {q.options.map((option, oIndex) => (
                                <button
                                    key={oIndex}
                                    onClick={() => handleAnswer(qIndex, option)}
                                    className={`text-left p-5 sm:p-6 rounded-2xl border-2 transition-all group flex items-start gap-4 overflow-hidden ${userAnswers[qIndex] === option
                                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-xl shadow-purple-900/20'
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-200'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 text-sm font-black transition-all ${userAnswers[qIndex] === option ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-700 text-gray-600 group-hover:border-gray-500'
                                        }`}>
                                        {String.fromCharCode(65 + oIndex)}
                                    </div>
                                    <span className="flex-1 min-w-0 break-words leading-relaxed font-medium">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderResults = () => {
        const isHistoryView = !timerInterval && quizState === 'result';

        return (
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"></div>
                    <div className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4">Quiz Review</div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white mb-2">
                        Performance: <span className={
                            quizResult.score >= 80 ? 'text-green-500' :
                                quizResult.score >= 50 ? 'text-orange-500' : 'text-red-500'
                        }>{quizResult.score}%</span>
                    </h2>

                    <div className="flex justify-center gap-10 sm:gap-20 mt-10">
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{quizResult.correctCount}</div>
                            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">Correctly Solved</div>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{currentQuiz.questions.length}</div>
                            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">Total Questions</div>
                        </div>
                    </div>

                    <div className="mt-10 p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-4 text-left">
                        <div className="text-3xl">✨</div>
                        <div>
                            <div className="text-purple-300 font-bold text-xs uppercase mb-1">AI Suggestion</div>
                            <p className="text-gray-200 text-sm leading-relaxed">{quizResult.feedback}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => navigate('/ai-quiz')}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/10 text-sm"
                        >
                            Return to Quizzes
                        </button>
                    </div>
                </div>

                <div className="space-y-12">
                    <h3 className="text-2xl font-black text-white px-2 flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-sm">📄</span>
                        Question & Answer Key
                    </h3>

                    {currentQuiz.questions.map((q, qIndex) => {
                        const isCorrect = userAnswers[qIndex]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();

                        return (
                            <div key={qIndex} className={`bg-white/5 border-2 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden group ${isCorrect ? 'border-green-500/20' : 'border-red-500/20'}`}>
                                <div className={`absolute top-0 left-0 w-2 h-full ${isCorrect ? 'bg-green-500/40' : 'bg-red-500/40'}`}></div>
                                <div className="flex justify-between items-start mb-8 gap-6">
                                    <div className="space-y-2 flex-1">
                                        <div className={`font-black text-xs uppercase tracking-[0.3em] ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                            Question {qIndex + 1} • {isCorrect ? 'Correct' : 'Incorrect'}
                                        </div>
                                        <h4 className="text-xl sm:text-2xl text-white font-bold leading-tight">
                                            {q.question}
                                        </h4>
                                    </div>
                                    <span className="px-4 py-1.5 bg-white/5 text-gray-400 text-[10px] sm:text-xs rounded-full border border-white/10 whitespace-nowrap uppercase tracking-widest font-black shrink-0">
                                        {q.topic}
                                    </span>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    {q.options.map((option, oIndex) => {
                                        const isSelected = userAnswers[qIndex] === option;
                                        const isCorrectOption = option?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();

                                        let styleClass = "bg-white/5 border-white/5 text-gray-400";
                                        if (isCorrectOption) {
                                            styleClass = "bg-green-500/20 border-green-500 text-green-300";
                                        } else if (isSelected && !isCorrectOption) {
                                            styleClass = "bg-red-500/20 border-red-500 text-red-300";
                                        }

                                        return (
                                            <div
                                                key={oIndex}
                                                className={`p-5 rounded-2xl border-2 transition-all flex items-start gap-4 overflow-hidden ${styleClass}`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 text-sm font-black ${isCorrectOption ? 'bg-green-500 border-green-500 text-white' :
                                                    (isSelected ? 'bg-red-500 border-red-500 text-white' : 'border-gray-700 text-gray-600')
                                                    }`}>
                                                    {String.fromCharCode(65 + oIndex)}
                                                </div>
                                                <span className="flex-1 min-w-0 break-words leading-relaxed font-medium">{option}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {!isCorrect && (
                                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3">
                                        <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-500/20">Correct Answer</span>
                                        <span className="text-sm text-green-400 font-bold">{q.correctAnswer}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderHistory = () => (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-8 px-2 flex items-center gap-3">
                {/* <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">🕒</span> */}
                Quiz History
            </h2>
            {loadingHistory ? (
                <div className="flex flex-col items-center justify-center p-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-blue-400 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Records</p>
                </div>
            ) : quizHistory.length === 0 ? (
                <div className="text-center p-20 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                    <p className="text-gray-500 text-xl font-medium">No quiz attempts found. Start your journey! 🚀</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {quizHistory.map((quiz, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 rounded-[1.25rem] p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.08] transition-all group overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors"></div>
                            <div className="space-y-3 flex-1 px-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-lg font-black text-white group-hover:text-blue-300 transition-colors uppercase tracking-tight">{quiz.topics.join(", ")}</span>
                                    <span className={`px-2 py-0.5 text-[9px] rounded-lg uppercase font-black tracking-tighter border ${quiz.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        quiz.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        {quiz.difficulty}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>{new Date(quiz.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                    <span>{quiz.numberOfQuestions} Qs</span>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-0 flex items-center justify-between md:justify-end gap-10 px-4">
                                <div className="text-right">
                                    <div className={`text-3xl font-black transition-colors ${quiz.score >= 80 ? 'text-green-500' : quiz.score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                        {quiz.score}%
                                    </div>
                                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Efficiency</div>
                                </div>
                                <button
                                    onClick={() => navigate(`/ai-quiz/view/${quiz._id}`)}
                                    className="bg-white/10 group-hover:bg-blue-600 text-white min-w-[120px] py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5"
                                >
                                    Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen px-4 py-8 md:px-12 lg:px-24">
            {/* Tab Navigation */}
            {quizState === 'config' || activeTab === 'history' ? (
                <div className="flex justify-center mb-16">
                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                        <button
                            onClick={() => setActiveTab('generate')}
                            className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'generate' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 translate-y-[-1px]' : 'text-gray-500 hover:text-white'}`}
                        >
                            Builder
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-y-[-1px]' : 'text-gray-500 hover:text-white'}`}
                        >
                            Logbook
                        </button>
                    </div>
                </div>
            ) : null}

            {/* Content Areas */}
            {quizState === 'loading' ? (
                <div className="flex flex-col items-center justify-center p-40 space-y-10">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <div className="w-32 h-32 border-[6px] border-purple-500/10 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">
                            🧬
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">Generating Quiz...</h3>
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-[0.2em] animate-pulse">Please wait while generating your quiz...</p>
                    </div>
                </div>
            ) : activeTab === 'generate' ? (
                <>
                    {quizState === 'config' && renderConfig()}
                    {quizState === 'active' && renderActiveQuiz()}
                    {quizState === 'result' && renderResults()}
                </>
            ) : (
                renderHistory()
            )}
        </div>
    );
};

export default AiQuiz;
