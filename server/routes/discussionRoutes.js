import express from "express";
import { getCommunities, getCommunityPosts, createPost, getPostDetails, addComment, seedCommunities, deletePost, deleteComment } from "../controllers/discussionController.js";

const discussionRouter = express.Router();

discussionRouter.get("/communities", getCommunities);
discussionRouter.get("/seed", seedCommunities);
discussionRouter.get("/:slug/posts", getCommunityPosts);

discussionRouter.post("/post", createPost); 
discussionRouter.get("/post/:postId", getPostDetails);
discussionRouter.delete("/post/:postId", deletePost);
discussionRouter.post("/comment", addComment);
discussionRouter.delete("/comment/:commentId", deleteComment);

export default discussionRouter;
