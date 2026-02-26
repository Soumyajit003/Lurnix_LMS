import React from 'react';
import { useQuizContext } from '../../context/QuizContext';

/**
 * Modal to warn users when they attempt to exit an active quiz.
 * Provides an option to auto-submit before leaving.
 */
const ExitConfirmModal = ({ onConfirm, onCancel }) => {
    const { animatePopup } = useQuizContext();

    return (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center px-4 transition-all duration-500 ${animatePopup ? 'opacity-100 backdrop-blur-md' : 'opacity-0 backdrop-blur-0'}`}>
            <div className={`absolute inset-0 bg-[#0a0518]/90 transition-opacity duration-500 ${animatePopup ? 'opacity-100' : 'opacity-0'}`} onClick={onCancel} />
            <div className={`
                bg-[#120b25] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 relative z-10 shadow-2xl transition-all duration-500 transform
                ${animatePopup ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}
            `}>
                <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-3">Leave Quiz?</h3>
                <p className="text-gray-400 text-center text-sm mb-10 leading-relaxed px-4">
                    If you go back now, your quiz will be <span className="text-amber-500 font-bold underline decoration-2 underline-offset-4">automatically submitted</span>. Are you sure you want to exit?
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onCancel}
                        className="w-full border border-white/10 hover:bg-white/5 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300"
                    >
                        Stay
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-[#0a0518] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-amber-500/20"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExitConfirmModal;
