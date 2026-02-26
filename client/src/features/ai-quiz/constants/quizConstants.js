/**
 * Constants for the AI Quiz feature.
 */

export const QUIZ_STATES = {
    CONFIG: 'config',
    LOADING: 'loading',
    ACTIVE: 'active',
    SUBMITTING: 'submitting',
    RESULT: 'result'
};

export const LOADING_TYPES = {
    GENERATING: 'generating',
    SUBMITTING: 'submitting',
    LOADING: 'loading'
};
export const DIFFICULTY_LEVELS = [
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' }
];

export const QUESTION_COUNT_OPTIONS = [
    { label: '5 Questions', value: 5 },
    { label: '10 Questions', value: 10 },
    { label: '15 Questions', value: 15 },
    { label: '20 Questions', value: 20 }
];

export const STORAGE_KEYS = {
    QUIZ_PROGRESS: (quizId) => `quiz_progress_${quizId}`
};
