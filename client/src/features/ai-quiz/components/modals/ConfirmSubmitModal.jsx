import React from 'react';
import { useQuizContext } from '../../context/QuizContext';

/**
 * Modal to confirm quiz submission.
 * Shows stats about answered vs. total questions.
 */
const ConfirmSubmitModal = ({ onConfirm, onCancel }) => {
    const { currentQuiz, userAnswers, animatePopup } = useQuizContext();

    const answeredCount = userAnswers.filter(a => a !== '').length;
    const totalCount = currentQuiz?.numberOfQuestions || 0;

    return (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center px-4 transition-all duration-500 ${animatePopup ? 'opacity-100 backdrop-blur-md' : 'opacity-0 backdrop-blur-0'}`}>
            <div className={`absolute inset-0 bg-[#0a0518]/90 transition-opacity duration-500 ${animatePopup ? 'opacity-100' : 'opacity-0'}`} onClick={onCancel} />
            <div className={`
                bg-[#120b25] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-10 relative z-10 shadow-2xl transition-all duration-500 transform
                ${animatePopup ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'}
            `}>
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-3">Ready to Finish?</h3>
                <p className="text-gray-400 text-center text-sm mb-8 leading-relaxed">
                    You've answered <span className="text-emerald-400 font-bold">{answeredCount}</span> out of <span className="text-white font-bold">{totalCount}</span> questions.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0518] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300"
                    >
                        Yes, Submit Quiz
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300"
                    >
                        Not Yet, Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmSubmitModal;
