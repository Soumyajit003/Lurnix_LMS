import React from 'react';
import { useQuizContext } from '../../context/QuizContext';
import { assets } from '../../../../assets/assets';

/**
 * Component to display the results of a submitted quiz.
 * Includes score visualization, AI feedback, and a detailed question-by-question review.
 */
const QuizResultsView = ({ onBack }) => {
    const { currentQuiz, quizResult, userAnswers } = useQuizContext();

    if (!quizResult || !currentQuiz) return null;

    // Helper to check if an answer is correct (same logic as backend for UI consistency)
    const isAnsCorrect = (uAns, cAns) => uAns?.trim().toLowerCase() === cAns?.trim().toLowerCase();

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header: Score & AI Feedback */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 sm:p-12 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10"></div>

                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    <div className="relative">
                        <svg className="w-40 h-40 transform -rotate-90">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                            <circle
                                cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10"
                                strokeDasharray={440} strokeDashoffset={440 - (440 * quizResult.score) / 100}
                                className="text-purple-500 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white">{quizResult.score}%</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</span>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                                AI Quiz
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
                            You answered {quizResult.correctCount} / {currentQuiz.questions.length} correctly!
                        </h2>
                        <p className="text-gray-400 text-sm italic leading-relaxed">
                            "{quizResult.feedback}"
                        </p>
                    </div>
                </div>
            </div>

            {/* List of Questions with Review */}
            <div className="my-12 flex justify-center">
                <button
                    onClick={onBack}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] transition-all duration-300"
                >
                    Back to Generator
                </button>
            </div>

            <div className="space-y-6">
                <h3 className="text-gray-400 text-[10px] uppercase font-black tracking-[0.3em] mb-8 ml-4">
                    Detailed Question Review
                </h3>
                {currentQuiz.questions.map((q, qIndex) => {
                    const isCorrect = isAnsCorrect(userAnswers[qIndex], q.correctAnswer);
                    return (
                        <div key={qIndex} className="bg-[#120b25] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 whitespace-nowrap">Question {qIndex + 1}</span>
                                {isCorrect ? (
                                    <span className="bg-emerald-500/10 text-emerald-400 px-3 sm:px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 w-fit">
                                        <span className="hidden sm:inline">Correct</span>
                                        <span className="sm:hidden">✓</span> {/* Visual placeholder or just keep it small */}
                                    </span>
                                ) : (
                                    <span className="bg-rose-500/10 text-rose-400 px-3 sm:px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 w-fit">
                                        <span className="hidden sm:inline">Incorrect</span>
                                        <span className="sm:hidden">✗</span>
                                    </span>
                                )}
                            </div>

                            <h4 className="text-lg font-bold text-white mb-8 leading-relaxed">{q.question}</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                                {q.options.map((option, oIndex) => {
                                    const isUserChoice = userAnswers[qIndex] === option;
                                    const isCorrectOpt = option === q.correctAnswer;

                                    let variant = 'default';
                                    if (isCorrectOpt) variant = 'correct';
                                    else if (isUserChoice && !isCorrectOpt) variant = 'wrong';

                                    return (
                                        <div
                                            key={oIndex}
                                            className={`
                                                flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                                                ${variant === 'correct' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' :
                                                    variant === 'wrong' ? 'bg-rose-500/10 border-rose-500/50 text-rose-300' :
                                                        'bg-white/5 border-white/5 text-gray-500 opacity-60'}
                                            `}
                                        >
                                            <div className={`
                                                w-8 h-8 rounded-lg flex-shrink-0 aspect-square flex items-center justify-center font-black text-xs
                                                ${variant === 'correct' ? 'bg-emerald-500 text-[#0a0518]' :
                                                    variant === 'wrong' ? 'bg-rose-500 text-black' :
                                                        'bg-white/10 text-gray-600'}
                                            `}>
                                                {String.fromCharCode(65 + oIndex)}
                                            </div>
                                            <span className="text-sm font-bold">{option}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mobile-optimized Topic Badge */}
                            {q.topic && (
                                <div className="flex justify-end">
                                    <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full w-fit">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{q.topic}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            

        </div>
    );
};

export default QuizResultsView;
