import { useCallback } from 'react';
import { STORAGE_KEYS } from '../constants/quizConstants';

/**
 * Custom hook to handle saving and retrieving quiz progress from localStorage.
 */
const useLocalQuizPersistence = () => {
    const saveProgress = useCallback((quizId, answers, timeLeft) => {
        if (!quizId) return;
        const progress = {
            answers,
            endTime: Date.now() + timeLeft * 1000,
            lastSaved: Date.now()
        };
        localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS(quizId), JSON.stringify(progress));
    }, []);

    const getProgress = useCallback((quizId) => {
        if (!quizId) return null;
        const saved = localStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS(quizId));
        if (!saved) return null;

        try {
            const progress = JSON.parse(saved);
            const remaining = Math.round((progress.endTime - Date.now()) / 1000);

            return {
                answers: progress.answers,
                timeLeft: remaining > 0 ? remaining : 0,
                isExpired: remaining <= 0
            };
        } catch (e) {
            console.error("Failed to parse local quiz progress", e);
            return null;
        }
    }, []);

    const clearProgress = useCallback((quizId) => {
        if (!quizId) return;
        localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS(quizId));
    }, []);

    return { saveProgress, getProgress, clearProgress };
};

export default useLocalQuizPersistence;
