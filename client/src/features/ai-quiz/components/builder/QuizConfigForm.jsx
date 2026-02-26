import React from 'react';
import { useQuizContext } from '../../context/QuizContext';
import CustomSelect from './CustomSelect';
import { DIFFICULTY_LEVELS, QUESTION_COUNT_OPTIONS } from '../../constants/quizConstants';

/**
 * Configuration form for generating a new AI Quiz.
 * Includes topic input and custom selects for difficulty and question count.
 */
const QuizConfigForm = ({ onGenerate }) => {
    const {
        topics, setTopics,
        difficulty, setDifficulty,
        numQuestions, setNumQuestions
    } = useQuizContext();

    return (
        <div className="max-w-2xl mx-auto p-8 sm:p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative group">
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden -z-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 blur-[80px]"></div>
            </div>

            <div className="flex flex-col items-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center tracking-tight">Generate AI Quiz</h2>
            </div>

            <div className="space-y-8">
                <div>
                    <label className="block text-gray-400 text-[10px] uppercase font-black tracking-widest mb-3 px-1">Topic(s)</label>
                    <input
                        type="text"
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        placeholder="e.g. Quantum Physics, Node js..."
                        className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:bg-white/[0.08] transition-all duration-300 outline-none font-bold"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <CustomSelect
                        label="Difficulty"
                        value={difficulty}
                        options={DIFFICULTY_LEVELS}
                        onChange={setDifficulty}
                    />
                    <CustomSelect
                        label="Questions"
                        value={numQuestions}
                        options={QUESTION_COUNT_OPTIONS}
                        onChange={setNumQuestions}
                    />
                </div>

                <button
                    onClick={onGenerate}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-xs uppercase tracking-[0.2em] group"
                >
                    <span className="flex items-center justify-center gap-3">
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Initialize AI Generation
                    </span>
                </button>
            </div>
        </div>
    );
};

export default QuizConfigForm;
