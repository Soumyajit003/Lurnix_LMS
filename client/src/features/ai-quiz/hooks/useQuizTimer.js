import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to manage the quiz countdown timer.
 */
const useQuizTimer = (timeLeft, setTimeLeft, onTimeUp) => {
    const timerIntervalRef = useRef(null);
    const onTimeUpRef = useRef(onTimeUp);

    // Keep ref updated with latest callback
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    const stopTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }, []);

    const startTimer = useCallback((seconds) => {
        stopTimer();
        setTimeLeft(seconds);

        timerIntervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    if (onTimeUpRef.current) onTimeUpRef.current();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stopTimer, setTimeLeft, onTimeUp]);

    useEffect(() => {
        return () => stopTimer();
    }, [stopTimer]);

    return { startTimer, stopTimer };
};

export default useQuizTimer;
