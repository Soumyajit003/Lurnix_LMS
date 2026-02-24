import express from "express";
import { generateQuiz, getQuizById, getUserQuizzes, submitQuiz } from "../controllers/aiController.js";

const aiRouter = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
        return res.json({ success: false, message: "Unauthorized. Please login." });
    }
    next();
};

aiRouter.post("/generate-quiz", requireAuth, generateQuiz);
aiRouter.post("/submit-quiz", requireAuth, submitQuiz);
aiRouter.get("/user-quizzes", requireAuth, getUserQuizzes);
aiRouter.get("/quiz/:quizId", requireAuth, getQuizById);

export default aiRouter;
