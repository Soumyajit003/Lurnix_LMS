import React, { useEffect } from 'react';
import { useQuizContext } from '../../context/QuizContext';
import HistoryCard from './HistoryCard';

/**
 * Logbook view component.
 * Displays a list of all past quiz attempts.
 */
const QuizHistoryView = ({ onFetchHistory, onViewQuiz }) => {
    const { quizHistory, loadingHistory } = useQuizContext();

    useEffect(() => {
        onFetchHistory();
    }, [onFetchHistory]);

    if (loadingHistory) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6"></div>
                <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Logbooks...</p>
            </div>
        );
    }

    if (quizHistory.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Quizzes Found</h3>
                <p className="text-gray-500 text-sm">Your journey hasn't started yet. Generate your first quiz!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {quizHistory.map((quiz) => (
                <HistoryCard
                    key={quiz._id}
                    quiz={quiz}
                    onClick={onViewQuiz}
                />
            ))}
        </div>
    );
};

export default QuizHistoryView;
