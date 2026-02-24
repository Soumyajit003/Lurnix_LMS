import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    topics: [{ type: String, required: true }],
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    numberOfQuestions: { type: Number, required: true },
    questions: [
        {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true },
            topic: { type: String, required: true }
        }
    ],
    userAnswers: [{ type: String }],
    correctCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    feedback: { type: String },
}, { timestamps: true });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
