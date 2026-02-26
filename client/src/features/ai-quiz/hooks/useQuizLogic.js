import React, { useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { QUIZ_STATES, LOADING_TYPES } from '../constants/quizConstants';
import createQuizService from '../services/quizService';
import useQuizTimer from './useQuizTimer';
import useLocalQuizPersistence from './useLocalQuizPersistence';

/**
 * Main logic orchestrator for the AI Quiz feature.
 * Handles generation, submission, navigation guards, and lifecycle.
 */
const useQuizLogic = (context, { backendUrl, getToken, navigate }) => {
    const {
        quizState, setQuizState,
        loadingType, setLoadingType,
        topics, numQuestions, difficulty,
        currentQuiz, setCurrentQuiz,
        userAnswers, setUserAnswers,
        timeLeft, setTimeLeft,
        setQuizResult,
        setQuizHistory, setLoadingHistory,
        setShowConfirmPopup, setShowExitConfirmPopup,
        setAnimatePopup
    } = context;

    const quizService = React.useMemo(() => createQuizService(backendUrl, getToken), [backendUrl, getToken]);
    const { saveProgress, getProgress, clearProgress } = useLocalQuizPersistence();

    // -- API ACTIONS --

    const handleFetchHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const data = await quizService.fetchHistory();
            if (data.success) setQuizHistory(data.quizzes);
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingHistory(false);
        }
    }, [quizService, setQuizHistory, setLoadingHistory]);

    const handleGenerateQuiz = useCallback(async () => {
        if (!topics.trim()) return toast.error("Please enter at least one topic");
        setLoadingType(LOADING_TYPES.GENERATING);
        setQuizState(QUIZ_STATES.LOADING);
        try {
            const data = await quizService.generateQuiz({
                topics,
                difficulty,
                numberOfQuestions: numQuestions
            });
            if (data.success) {
                // Transition to LOADING details so the page effect can pick it up
                setLoadingType(LOADING_TYPES.LOADING);
                navigate(`/ai-quiz/take/${data.quiz._id}`);
            } else {
                toast.error(data.message);
                setQuizState(QUIZ_STATES.CONFIG);
            }
        } catch (error) {
            toast.error(error.message);
            setQuizState(QUIZ_STATES.CONFIG);
        }
    }, [topics, difficulty, numQuestions, quizService, setQuizState, setLoadingType, navigate]);

    const handleFetchQuizDetails = useCallback(async (id) => {
        setLoadingType(LOADING_TYPES.LOADING);
        setQuizState(QUIZ_STATES.LOADING);
        try {
            const data = await quizService.fetchQuizDetails(id);
            if (data.success) {
                setCurrentQuiz(data.quiz);
                setQuizResult({
                    score: data.quiz.score,
                    correctCount: data.quiz.correctCount,
                    feedback: data.quiz.feedback
                });
                setUserAnswers(data.quiz.userAnswers || []);
                setQuizState(QUIZ_STATES.RESULT);
            } else {
                toast.error(data.message);
                setQuizState(QUIZ_STATES.CONFIG);
            }
        } catch (error) {
            toast.error(error.message);
            setQuizState(QUIZ_STATES.CONFIG);
        }
    }, [quizService, setCurrentQuiz, setQuizResult, setQuizState, setLoadingType]);

    // -- TIMER & SUBMISSION RELAY --
    // We use a ref to break the circular dependency between handleSubmitQuiz and stopTimer
    const submitRelayRef = React.useRef(null);
    const handleTimeUp = useCallback(() => {
        if (submitRelayRef.current) submitRelayRef.current(true);
    }, []);

    const { startTimer, stopTimer } = useQuizTimer(timeLeft, setTimeLeft, handleTimeUp);

    const handleSubmitQuiz = useCallback(async (isAuto = false, isConfirmed = false, answersToSubmit = null, quizIdOverride = null) => {
        // Core Guard: Only allow submission from ACTIVE state (or if explicit override)
        if (quizState !== QUIZ_STATES.ACTIVE && !quizIdOverride) return;
        if (quizState === QUIZ_STATES.SUBMITTING) return;

        const currentAnswers = answersToSubmit || userAnswers;
        const targetQuizId = quizIdOverride || (currentQuiz ? currentQuiz._id : null);

        if (!isAuto && !isConfirmed) {
            setShowConfirmPopup(true);
            return;
        }

        // --- SUBMISSION COMMENCES ---
        setQuizState(QUIZ_STATES.SUBMITTING);
        setLoadingType(LOADING_TYPES.SUBMITTING);
        setShowConfirmPopup(false);
        setShowExitConfirmPopup(false);
        setAnimatePopup(false);
        stopTimer();

        try {
            const data = await quizService.submitQuiz({
                quizId: targetQuizId,
                userAnswers: currentAnswers
            });

            if (data.success) {
                clearProgress(targetQuizId);
                setQuizResult(data);
                setQuizState(QUIZ_STATES.RESULT);
                if (isAuto) toast.info("Time is up! Quiz submitted automatically.");
                navigate(`/ai-quiz/view/${targetQuizId}`);
            } else {
                toast.error(data.message || "Submission failed. Please try again.");
                setQuizState(QUIZ_STATES.ACTIVE);
            }
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to submit quiz.");
            setQuizState(QUIZ_STATES.ACTIVE);
        }
    }, [quizState, currentQuiz, userAnswers, quizService, setQuizState, setLoadingType, setQuizResult, clearProgress, navigate, setShowConfirmPopup, setShowExitConfirmPopup, setAnimatePopup, stopTimer]);

    // Update relay ref whenever handleSubmitQuiz changes
    useEffect(() => {
        submitRelayRef.current = handleSubmitQuiz;
    }, [handleSubmitQuiz]);

    const handleFetchQuizForTaking = useCallback(async (id) => {
        setLoadingType(LOADING_TYPES.LOADING);
        setQuizState(QUIZ_STATES.LOADING);
        try {
            const data = await quizService.fetchQuizDetails(id);
            if (data.success) {
                const quiz = data.quiz;
                setCurrentQuiz(quiz);

                // Persistence Logic
                const saved = getProgress(id);
                if (saved) {
                    if (saved.isExpired) {
                        toast.info("Time was up while you were away! Submitting results.");
                        handleSubmitQuiz(true, true, saved.answers, id);
                        return;
                    }
                    setUserAnswers(saved.answers);
                    setTimeLeft(saved.timeLeft);
                    startTimer(saved.timeLeft);
                } else {
                    const duration = quiz.numberOfQuestions * 60;
                    setUserAnswers(new Array(quiz.numberOfQuestions).fill(''));
                    setTimeLeft(duration);
                    startTimer(duration);
                }
                setQuizState(QUIZ_STATES.ACTIVE);
            } else {
                toast.error(data.message);
                setQuizState(QUIZ_STATES.CONFIG);
            }
        } catch (error) {
            toast.error(error.message);
            setQuizState(QUIZ_STATES.CONFIG);
        }
    }, [quizService, setCurrentQuiz, setUserAnswers, setTimeLeft, startTimer, getProgress, handleSubmitQuiz, setQuizState, setLoadingType]);

    // -- NAVIGATION GUARDS & PERSISTENCE --

    useEffect(() => {
        if (quizState !== QUIZ_STATES.ACTIVE) return;
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            setShowExitConfirmPopup(true);
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [quizState, setShowExitConfirmPopup]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (quizState === QUIZ_STATES.ACTIVE) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [quizState]);

    useEffect(() => {
        if (quizState === QUIZ_STATES.ACTIVE && currentQuiz?._id) {
            saveProgress(currentQuiz._id, userAnswers, timeLeft);
        }
    }, [userAnswers, timeLeft, quizState, currentQuiz, saveProgress]);

    // Popup Animation Effect
    useEffect(() => {
        if (context.showConfirmPopup || context.showExitConfirmPopup) {
            setTimeout(() => setAnimatePopup(true), 10);
        } else {
            setAnimatePopup(false);
        }
    }, [context.showConfirmPopup, context.showExitConfirmPopup, setAnimatePopup]);

    return React.useMemo(() => ({
        handleFetchHistory,
        handleGenerateQuiz,
        handleFetchQuizDetails,
        handleFetchQuizForTaking,
        handleSubmitQuiz,
        startTimer,
        stopTimer
    }), [
        handleFetchHistory,
        handleGenerateQuiz,
        handleFetchQuizDetails,
        handleFetchQuizForTaking,
        handleSubmitQuiz,
        startTimer,
        stopTimer
    ]);
};

export default useQuizLogic;
