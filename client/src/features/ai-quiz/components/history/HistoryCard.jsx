import React from 'react';

/**
 * Card component for an individual quiz history item.
 */
const HistoryCard = ({ quiz, onClick }) => {
    return (
        <div
            onClick={() => onClick(quiz._id)}
            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:border-purple-500/50 hover:bg-white/10 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl hover:shadow-purple-500/10"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl -z-10 group-hover:bg-purple-500/20 transition-all duration-500"></div>

            <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex flex-col items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-purple-500/20 group-hover:border-purple-500/40">
                    <span className="text-[10px] font-black text-purple-400/60 leading-none mb-0.5">SCORE</span>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-sm font-black text-white group-hover:text-purple-200 transition-colors">
                            {String(quiz.correctCount).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-bold text-white/30">/</span>
                        <span className="text-[10px] font-bold text-white/40">
                            {String(quiz.numberOfQuestions).padStart(2, '0')}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] uppercase font-black tracking-widest text-purple-400 mb-1 opacity-60">Percentage</div>
                    <div className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors duration-500">{quiz.score}%</div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative overflow-hidden">
                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:translate-x-1 transition-transform duration-500">
                        {quiz.topics.join(', ')}
                    </h3>
                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-purple-500/30 group-hover:w-full transition-all duration-700"></div>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black tracking-widest uppercase">
                    <span className={`px-2 py-1 rounded-lg ${quiz.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                        quiz.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                        }`}>
                        {quiz.difficulty}
                    </span>
                    <span className="opacity-30">•</span>
                    <span className="group-hover:text-gray-300 transition-colors">{new Date(quiz.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default HistoryCard;
