import mongoose from 'mongoose';

const resumeReviewSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    fileName: { type: String, default: 'Pasted Resume' },
    resumeText: { type: String, required: true },
    targetJobDescription: { type: String, default: '' },
    reviewData: {
        score: { type: Number, required: true },
        summary: { type: String, required: true },
        formattingScore: { type: Number, required: true },
        contentImpactScore: { type: Number, required: true },
        languageScore: { type: Number, required: true },
        tailoringScore: { type: Number, default: 0 },
        strengths: [{ type: String }],
        improvements: [
            {
                category: { type: String },
                issue: { type: String },
                suggestion: { type: String },
                example: { type: String }
            }
        ],
        sectionFeedback: {
            summary: { type: String },
            experience: { type: String },
            education: { type: String },
            skills: { type: String },
            projects: { type: String }
        },
        keywordAnalysis: {
            matchingKeywords: [{ type: String }],
            missingKeywords: [{ type: String }],
            recommendation: { type: String }
        }
    }
}, { timestamps: true });

const ResumeReview = mongoose.model('ResumeReview', resumeReviewSchema);
export default ResumeReview;
