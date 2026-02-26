import React from 'react';

/**
 * Renders a single multiple-choice option.
 * Handles styling for selected vs. unselected states.
 */
const OptionItem = ({ letter, text, isSelected, onClick }) => {
    return (
        <label
            onClick={onClick}
            className={`
                group flex items-center gap-4 p-5 rounded-[1.25rem] border-2 cursor-pointer transition-all duration-300
                ${isSelected
                    ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/8'}
            `}
        >
            <div className={`
                w-10 h-10 rounded-xl flex-shrink-0 aspect-square flex items-center justify-center font-black text-sm transition-all duration-300
                ${isSelected
                    ? 'bg-purple-500 text-white rotate-6'
                    : 'bg-white/10 text-gray-500 group-hover:bg-white/20 group-hover:text-gray-300'}
            `}>
                {letter}
            </div>
            <span className={`text-sm font-bold leading-relaxed transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {text}
            </span>
        </label>
    );
};

export default OptionItem;
