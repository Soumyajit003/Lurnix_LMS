import axios from 'axios';

/**
 * Service to handle all AI Quiz related API calls.
 */
const createQuizService = (backendUrl, getToken) => {
    const getHeaders = async () => {
        const token = await getToken();
        return { Authorization: `Bearer ${token}` };
    };

    return {
        generateQuiz: async (payload) => {
            const headers = await getHeaders();
            const { data } = await axios.post(`${backendUrl}/api/ai/generate-quiz`, payload, { headers });
            return data;
        },

        submitQuiz: async (payload) => {
            const headers = await getHeaders();
            const { data } = await axios.post(`${backendUrl}/api/ai/submit-quiz`, payload, { headers });
            return data;
        },

        fetchQuizDetails: async (quizId) => {
            const headers = await getHeaders();
            const { data } = await axios.get(`${backendUrl}/api/ai/quiz/${quizId}`, { headers });
            return data;
        },

        fetchHistory: async () => {
            const headers = await getHeaders();
            const { data } = await axios.get(`${backendUrl}/api/ai/user-quizzes`, { headers });
            return data;
        }
    };
};

export default createQuizService;
