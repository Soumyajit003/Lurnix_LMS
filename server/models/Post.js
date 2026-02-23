import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post;
