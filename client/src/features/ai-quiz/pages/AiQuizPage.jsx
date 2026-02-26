import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation, useMatch } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';

import { QuizProvider, useQuizContext } from '../context/QuizContext';
import useQuizLogic from '../hooks/useQuizLogic';
import { QUIZ_STATES, LOADING_TYPES } from '../constants/quizConstants';

// Components
import QuizHeader from '../components/header/QuizHeader';
import QuizConfigForm from '../components/builder/QuizConfigForm';
import ActiveQuizView from '../components/active/ActiveQuizView';
import QuizResultsView from '../components/results/QuizResultsView';
import QuizHistoryView from '../components/history/QuizHistoryView';
import ConfirmSubmitModal from '../components/modals/ConfirmSubmitModal';
import ExitConfirmModal from '../components/modals/ExitConfirmModal';

/**
 * Internal component that uses the QuizContext to render the appropriate view.
 */
const AiQuizContent = () => {
    const context = useQuizContext();
    const {
        activeTab, setActiveTab,
        quizState, setQuizState,
        loadingType,
        currentQuiz,
        handleAnswer: originalHandleAnswer, // Note: functionality moved to logic hook
        showConfirmPopup, setShowConfirmPopup,
        showExitConfirmPopup, setShowExitConfirmPopup
    } = context;

    const { backendUrl } = useContext(AppContext);
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Robustly extract quizId using useMatch for consolidated routes
    const takeMatch = useMatch('/ai-quiz/take/:id');
    const viewMatch = useMatch('/ai-quiz/view/:id');
    const quizId = takeMatch?.params.id || viewMatch?.params.id;

    const logic = useQuizLogic(context, { backendUrl, getToken, navigate });
    const { handleFetchQuizForTaking, handleFetchQuizDetails } = logic;

    // Handle initial routing and deep links
    useEffect(() => {
        const isTakeMode = location.pathname.includes('/ai-quiz/take/');
        const isViewMode = location.pathname.includes('/ai-quiz/view/');

        if (isTakeMode && quizId) {
            const isCorrectQuiz = currentQuiz?._id === quizId;
            const isReady = quizState === QUIZ_STATES.ACTIVE;

            // Only block if we are ALREADY fetching details or submitting
            // We should NOT block if we are in GENERATING state, as that means generation just finished
            const isBusy = (quizState === QUIZ_STATES.LOADING && loadingType === LOADING_TYPES.LOADING) ||
                quizState === QUIZ_STATES.SUBMITTING;

            if (!isBusy && (!isReady || !isCorrectQuiz)) {
                handleFetchQuizForTaking(quizId);
            }
        } else if (isViewMode && quizId) {
            const isCorrectQuiz = currentQuiz?._id === quizId;
            const isReady = quizState === QUIZ_STATES.RESULT;
            const isBusy = (quizState === QUIZ_STATES.LOADING && loadingType === LOADING_TYPES.LOADING) ||
                quizState === QUIZ_STATES.SUBMITTING;

            if (!isBusy && (!isReady || !isCorrectQuiz)) {
                handleFetchQuizDetails(quizId);
            }
        } else {
            // Sync with base routes (config/history)
            const targetTab = location.pathname.includes('/history') ? 'history' : 'generate';

            // Reset back to config if we are in any transient state while on base routes
            if (quizState !== QUIZ_STATES.CONFIG && loadingType !== LOADING_TYPES.GENERATING) {
                setQuizState(QUIZ_STATES.CONFIG);
            }

            if (activeTab !== targetTab) {
                setActiveTab(targetTab);
            }
        }
    }, [quizId, location.pathname, quizState, loadingType, currentQuiz?._id, activeTab, handleFetchQuizForTaking, handleFetchQuizDetails, setQuizState, setActiveTab]);

    // Local handleAnswer to handle toggling (logic moved to hook would be cleaner, but keeping it simple here)
    const handleAnswerUpdate = (index, option) => {
        const newAnswers = [...context.userAnswers];
        newAnswers[index] = newAnswers[index] === option ? '' : option;
        context.setUserAnswers(newAnswers);
    };

    if (quizState === QUIZ_STATES.LOADING || quizState === QUIZ_STATES.SUBMITTING) {
        const isSubmitting = quizState === QUIZ_STATES.SUBMITTING || loadingType === LOADING_TYPES.SUBMITTING;
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <h2 className="mt-10 text-xl font-bold text-white uppercase tracking-[0.2em] animate-pulse text-center">
                    {loadingType === LOADING_TYPES.GENERATING ? 'Generating AI Quiz...' :
                        isSubmitting ? 'Analyzing Your Performance...' :
                            'Retrieving Quiz Details...'}
                </h2>
                <p className="mt-4 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    {isSubmitting ? 'Finalizing results with AI' : 'Please wait while we process with AI'}
                </p>
            </div>
        );
    }

    return (
        <div className={`transition-all duration-500 ${quizState === QUIZ_STATES.ACTIVE ? 'pt-0' : 'pt-10'}`}>
            {/* Navigation Guards Modals */}
            {showConfirmPopup && (
                <ConfirmSubmitModal
                    onConfirm={() => logic.handleSubmitQuiz(false, true)}
                    onCancel={() => setShowConfirmPopup(false)}
                />
            )}
            {showExitConfirmPopup && (
                <ExitConfirmModal
                    onConfirm={() => logic.handleSubmitQuiz(false, true)}
                    onCancel={() => setShowExitConfirmPopup(false)}
                />
            )}

            {/* Active Quiz Header */}
            {quizState === QUIZ_STATES.ACTIVE && (
                <QuizHeader onFinish={() => logic.handleSubmitQuiz(false)} />
            )}

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {quizState === QUIZ_STATES.CONFIG && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Tab Switcher */}
                        <div className="flex justify-center mb-12">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex gap-1">
                                {['generate', 'history'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            navigate(tab === 'history' ? '/ai-quiz/history' : '/ai-quiz');
                                        }}
                                        className={`
                                            px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                                            ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}
                                        `}
                                    >
                                        {tab === 'generate' ? 'Generator' : 'Logbook'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeTab === 'generate' ? (
                            <QuizConfigForm onGenerate={logic.handleGenerateQuiz} />
                        ) : (
                            <QuizHistoryView
                                onFetchHistory={logic.handleFetchHistory}
                                onViewQuiz={(id) => navigate(`/ai-quiz/view/${id}`)}
                            />
                        )}
                    </div>
                )}

                {quizState === QUIZ_STATES.ACTIVE && currentQuiz && (
                    <ActiveQuizView onAnswer={handleAnswerUpdate} />
                )}

                {quizState === QUIZ_STATES.RESULT && (
                    <QuizResultsView onBack={() => navigate('/ai-quiz')} />
                )}
            </div>
        </div>
    );
};

/**
 * The entry point for the AI Quiz feature.
 * Wraps the content in the Feature's Context Provider.
 */
const AiQuizPage = () => {
    return (
        <QuizProvider>
            <AiQuizContent />
        </QuizProvider>
    );
};

export default AiQuizPage;
