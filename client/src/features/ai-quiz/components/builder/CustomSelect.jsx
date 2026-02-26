import React, { useRef, useState, useEffect } from 'react';

/**
 * Custom dropdown component for the quiz configuration.
 * Handles clicking outside to close and shows a premium styled list.
 */
const CustomSelect = ({ label, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-gray-400 text-[10px] uppercase font-black tracking-widest mb-3 px-1">
                {label}
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full bg-white/5 backdrop-blur-xl border rounded-xl px-4 py-3.5 
                    text-white flex items-center justify-between cursor-pointer transition-all duration-300
                    ${isOpen ? 'border-purple-500 shadow-lg shadow-purple-500/10' : 'border-white/10 hover:border-purple-400/40'}
                `}
            >
                <span className="font-bold text-sm">
                    {typeof options.find(o => o.value === value)?.label !== 'undefined'
                        ? options.find(o => o.value === value).label
                        : value}
                </span>
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
};

export default CustomSelect;
