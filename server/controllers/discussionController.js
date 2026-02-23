import Community from "../models/Community.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

// Get all communities
export const getCommunities = async (req, res) => {
    try {
        const communities = await Community.find();
        res.json({ success: true, communities });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get posts for a specific community slug
export const getCommunityPosts = async (req, res) => {
    try {
        const { slug } = req.params;
        const community = await Community.findOne({ slug });
        if (!community) {
            return res.json({ success: false, message: "Community not found" });
        }
        const posts = await Post.find({ community: community._id })
            .populate("author", "name imageUrl")
            .sort({ createdAt: -1 });
        res.json({ success: true, posts, community });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { title, content, communityId } = req.body;
        const authorId = req.auth.userId;

        const newPost = new Post({
            title,
            content,
            author: authorId,
            community: communityId,
        });

        await newPost.save();
        res.json({ success: true, message: "Post created successfully", post: newPost });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get post details and comments
export const getPostDetails = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId)
            .populate("author", "name imageUrl")
            .populate("community", "name slug");
        
        if (!post) {
            return res.json({ success: false, message: "Post not found" });
        }

        const comments = await Comment.find({ post: postId })
            .populate("author", "name imageUrl")
            .sort({ createdAt: -1 });

        res.json({ success: true, post, comments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add a comment
export const addComment = async (req, res) => {
    try {
        const { content, postId } = req.body;
        const authorId = req.auth.userId;

        const newComment = new Comment({
            content,
            author: authorId,
            post: postId,
        });

        await newComment.save();

        // Increment comment count in post
        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

        res.json({ success: true, message: "Comment added successfully", comment: newComment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Seed initial communities
export const seedCommunities = async (req, res) => {
    try {
        const initialCommunities = [
            { name: "Backend Community", slug: "backend", description: "Discuss everything related to servers, databases, and APIs." },
            { name: "Frontend Community", slug: "frontend", description: "Focus on UI/UX, React, CSS, and modern web interfaces." },
            { name: "DevOps Community", slug: "devops", description: "Clouds, CI/CD, Docker, and infrastructure as code." },
            { name: "AI / ML Community", slug: "ai-ml", description: "Artificial Intelligence, Machine Learning, and Data Science." },
            { name: "General Discussion", slug: "general", description: "A place for off-topic chats and general tech talk." },
        ];

        for (const community of initialCommunities) {
            await Community.findOneAndUpdate({ slug: community.slug }, community, { upsert: true, new: true });
        }

        res.json({ success: true, message: "Communities seeded successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

