import express from "express";
import { generateQuiz, getQuizById, getUserQuizzes, submitQuiz, generateRoadmap, saveRoadmap, getUserRoadmaps, reviewResume, getUserResumeReviews } from "../controllers/aiController.js";
import upload from "../configs/multer.js";

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

// Roadmap Routes
aiRouter.post("/roadmap", requireAuth, generateRoadmap);
aiRouter.post("/roadmap/save", requireAuth, saveRoadmap);
aiRouter.get("/roadmap/user", requireAuth, getUserRoadmaps);

// Resume Review Routes
aiRouter.post("/resume-review", requireAuth, upload.single('resume'), reviewResume);
aiRouter.get("/resume-reviews", requireAuth, getUserResumeReviews);

export default aiRouter;
