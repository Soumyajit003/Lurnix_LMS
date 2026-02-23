import express from "express";
import { getCommunities, getCommunityPosts, createPost, getPostDetails, addComment, seedCommunities } from "../controllers/discussionController.js";

const discussionRouter = express.Router();

discussionRouter.get("/communities", getCommunities);
discussionRouter.get("/seed", seedCommunities);
discussionRouter.get("/:slug/posts", getCommunityPosts);

discussionRouter.post("/post", createPost); // Auth middleware handled at server level or within route
discussionRouter.get("/post/:postId", getPostDetails);
discussionRouter.post("/comment", addComment);

export default discussionRouter;
