import React from 'react';
import { useQuizContext } from '../../context/QuizContext';
import QuestionCard from './QuestionCard';

/**
 * The main container for a live quiz session.
 * Renders the list of all questions.
 */
const ActiveQuizView = ({ onAnswer }) => {
    const { currentQuiz, userAnswers } = useQuizContext();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 mt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {currentQuiz.questions.map((q, index) => (
                <QuestionCard
                    key={index}
                    index={index}
                    question={q}
                    userAnswer={userAnswers[index]}
                    onAnswer={onAnswer}
                />
            ))}
        </div>
    );
};

export default ActiveQuizView;
