import React from 'react';
import OptionItem from './OptionItem';

/**
 * Renders a single question card with its title, topic, and options.
 */
const QuestionCard = ({ question, index, userAnswer, onAnswer }) => {
    const letters = ['A', 'B', 'C', 'D'];

    return (
        <div className="bg-[#120b25] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] -z-10 group-hover:bg-purple-500/10 transition-all duration-700"></div>

            <div className="flex items-center justify-between gap-4 mb-8">
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-purple-400 whitespace-nowrap">Question {index + 1}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-10">
                {question.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {question.options.map((option, optIndex) => (
                    <OptionItem
                        key={optIndex}
                        letter={letters[optIndex]}
                        text={option}
                        isSelected={userAnswer === option}
                        onClick={() => onAnswer(index, option)}
                    />
                ))}
            </div>

            {/* Bottom Topic Badge */}
            <div className="flex justify-end">
                <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full w-fit">
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{question.topic}</span>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
