import React, { createContext, useContext, useState, useMemo } from 'react';
import { QUIZ_STATES, LOADING_TYPES } from '../constants/quizConstants';

const QuizContext = createContext();

/**
 * Context Provider to manage the global state of the AI Quiz feature.
 */
export const QuizProvider = ({ children }) => {
    const [activeTab, setActiveTab] = useState('generate');
    const [quizState, setQuizState] = useState(QUIZ_STATES.CONFIG);
    const [loadingType, setLoadingType] = useState(LOADING_TYPES.GENERATING);

    // Config State
    const [topics, setTopics] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState(10);

    // Live Quiz State
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);

    // Results & History
    const [quizResult, setQuizResult] = useState(null);
    const [quizHistory, setQuizHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Popup States
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [showExitConfirmPopup, setShowExitConfirmPopup] = useState(false);
    const [animatePopup, setAnimatePopup] = useState(false);

    const value = useMemo(() => ({
        activeTab, setActiveTab,
        quizState, setQuizState,
        loadingType, setLoadingType,
        topics, setTopics,
        difficulty, setDifficulty,
        numQuestions, setNumQuestions,
        currentQuiz, setCurrentQuiz,
        userAnswers, setUserAnswers,
        timeLeft, setTimeLeft,
        quizResult, setQuizResult,
        quizHistory, setQuizHistory,
        loadingHistory, setLoadingHistory,
        showConfirmPopup, setShowConfirmPopup,
        showExitConfirmPopup, setShowExitConfirmPopup,
        animatePopup, setAnimatePopup
    }), [
        activeTab, quizState, loadingType, topics, difficulty, numQuestions,
        currentQuiz, userAnswers, timeLeft, quizResult, quizHistory,
        loadingHistory, showConfirmPopup, showExitConfirmPopup, animatePopup
    ]);

    return (
        <QuizContext.Provider value={value}>
            {children}
        </QuizContext.Provider>
    );
};

export const useQuizContext = () => {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error('useQuizContext must be used within a QuizProvider');
    }
    return context;
};
