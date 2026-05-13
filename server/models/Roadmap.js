import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    goal: { type: String, required: true },
    level: { type: String, required: true },
    studyTime: { type: String, required: true },
    learningStyle: { type: String, required: true },
    roadmapData: {
        title: { type: String, required: true },
        estimatedDuration: { type: String, required: true },
        phases: [
            {
                phaseTitle: { type: String, required: true },
                duration: { type: String, required: true },
                topics: [{ type: String }],
                projects: [{ type: String }],
                milestone: { type: String }
            }
        ]
    }
}, { timestamps: true });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

export default Roadmap;
