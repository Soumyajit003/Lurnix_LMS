import { GoogleGenerativeAI } from "@google/generative-ai";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate Quiz
export const generateQuiz = async (req, res) => {
    try {
        const { topics, difficulty, numberOfQuestions } = req.body;
        const userId = req.auth.userId;

        if (!topics || !difficulty || !numberOfQuestions) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert quiz generator.
        Generate ${numberOfQuestions} multiple-choice questions about: ${topics}.
        Difficulty level: ${difficulty}.

        Rules:
        - Each question must have 4 options.
        - Options should be plain text (do NOT include "A)", "B)", etc.).
        - Clearly mark the correct answer separately (return the full text of the correct option).
        - Format response in strict JSON format:

        [
        {
            "question": "...",
            "options": ["Option text 1", "Option text 2", "Option text 3", "Option text 4"],
            "correctAnswer": "Option text 1",
            "topic": "..."
        }
        ]

        Do NOT return explanations.
        Return only valid JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Basic JSON cleanup if Gemini returns markdown code blocks
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let questions;
        try {
            questions = JSON.parse(text);
        } catch (e) {
            console.error("Gemini JSON parse error:", e);
            return res.json({ success: false, message: "Failed to parse quiz questions from AI" });
        }

        const newQuiz = await Quiz.create({
            userId,
            topics: topics.split(",").map(t => t.trim()),
            difficulty,
            numberOfQuestions,
            questions,
            userAnswers: [],
            correctCount: 0,
            score: 0,
            feedback: ""
        });

        res.json({ success: true, quiz: newQuiz });

    } catch (error) {
        console.error("Generate Quiz Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Helper for robust answer checking
const isAnswerCorrect = (userAns, correctAns, options) => {
    if (!userAns || !correctAns) return false;
    const ua = userAns.trim().toLowerCase();
    const ca = correctAns.trim().toLowerCase();

    // Direct match
    if (ua === ca) return true;

    // Handle letter-based correct answers (e.g., correctAns is "C")
    if (ca.length === 1 && /^[a-d]$/.test(ca)) {
        const index = ca.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
        if (options && options[index] && options[index].trim().toLowerCase() === ua) {
            return true;
        }
    }

    // Handle user selection starting with letter (e.g., userAns is "C) Text")
    if (ua.length > 2 && /^[a-d][\s).:]/i.test(ua)) {
        const letter = ua[0].toLowerCase();
        if (letter === ca) return true;

        // Also check if the text part matches
        const textPart = ua.slice(2).trim();
        if (textPart === ca) return true;
    }

    return false;
};

// Submit Quiz
export const submitQuiz = async (req, res) => {
    try {
        const { quizId, userAnswers } = req.body;
        const userId = req.auth.userId;

        const quiz = await Quiz.findById(quizId);

        if (!quiz || quiz.userId !== userId) {
            return res.json({ success: false, message: "Quiz not found" });
        }

        const correctCount = quiz.questions.reduce((acc, q, index) => {
            if (isAnswerCorrect(userAnswers[index], q.correctAnswer, q.options)) {
                return acc + 1;
            }
            return acc;
        }, 0);

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        // Generate AI Feedback
        const weakTopics = [...new Set(quiz.questions
            .filter((q, index) => !isAnswerCorrect(userAnswers[index], q.correctAnswer, q.options))
            .map(q => q.topic))];

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const feedbackPrompt = `User scored ${score}% on topics: ${quiz.topics.join(", ")}.
        Weak areas: ${weakTopics.join(", ") || "None"}.
        Provide a one-line short improvement suggestion (max 20 words). Return plain text only.`;

        const result = await model.generateContent(feedbackPrompt);
        const response = await result.response;
        const feedback = response.text().trim();

        quiz.userAnswers = userAnswers;
        quiz.correctCount = correctCount;
        quiz.score = score;
        quiz.feedback = feedback;
        await quiz.save();

        res.json({
            success: true,
            score,
            correctCount,
            feedback
        });

    } catch (error) {
        console.error("Submit Quiz Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get Quiz By Id
export const getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.auth.userId;

        const quiz = await Quiz.findById(quizId);

        if (!quiz || quiz.userId !== userId) {
            return res.json({ success: false, message: "Quiz not found" });
        }

        res.json({ success: true, quiz });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get User Quizzes
export const getUserQuizzes = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 });

        res.json({ success: true, quizzes });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
