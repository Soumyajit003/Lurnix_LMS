import React from 'react';
import { useQuizContext } from '../../context/QuizContext';
import { formatTime } from '../../utils/formatTime';

/**
 * Sticky header for the active quiz session.
 * Displays the countdown timer, title, and finish button.
 */
const QuizHeader = ({ onFinish }) => {
    const { timeLeft } = useQuizContext();

    return (
        <div className="sticky top-1 left-0 w-full z-50 px-4 sm:px-10 py-5">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl flex items-center justify-between shadow-2xl shadow-black/40">
                <div className="flex items-center gap-3">
                    <div className={`
                        px-4 py-2 rounded-xl font-mono text-xl font-black tracking-tighter
                        ${timeLeft < 60 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-purple-500/20 text-purple-400'}
                    `}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="hidden md:block">
                    <h1 className="text-white text-[10px] uppercase font-black tracking-[0.3em] opacity-40">
                        AI Quiz Attempt
                    </h1>
                </div>

                <button
                    onClick={onFinish}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0a0518] px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Finish & Submit
                </button>
            </div>
        </div>
    );
};

export default QuizHeader;
