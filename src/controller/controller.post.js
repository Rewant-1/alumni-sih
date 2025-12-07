const PostService = require("../service/service.post.js");
const { sendSuccess, sendError, sendNotFound, sendBadRequest } = require("../../utils/response");

const createPost = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const postData = {
      ...req.body,
      postedBy: req.user.userId
    };
    
    const post = await PostService.createPost(postData, collegeId);
    
    return sendSuccess(res, post, "Post created successfully", 201);
  } catch (error) {
    console.error("Error creating post:", error);
    return sendError(res, "Failed to create post", 500, error.message);
  }
};

const getPosts = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const filters = {};
    
    // Optional filtering by postedBy
    if (req.query.postedBy) {
      filters.postedBy = req.query.postedBy;
    }
    
    const posts = await PostService.getPosts(collegeId, filters);
    
    return sendSuccess(res, posts, "Posts fetched successfully");
  } catch (error) {
    console.error("Error fetching posts:", error);
    return sendError(res, "Failed to fetch posts", 500, error.message);
  }
};

const getPostById = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const post = await PostService.getPostById(req.params.id, collegeId);
    
    if (!post) {
      return sendNotFound(res, "Post not found or access denied");
    }
    
    return sendSuccess(res, post, "Post fetched successfully");
  } catch (error) {
    console.error("Error fetching post:", error);
    return sendError(res, "Failed to fetch post", 500, error.message);
  }
};

const updatePost = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const userId = req.user.userId;
    
    const post = await PostService.updatePost(
      req.params.id, 
      req.body, 
      collegeId, 
      userId
    );
    
    return sendSuccess(res, post, "Post updated successfully");
  } catch (error) {
    console.error("Error updating post:", error);
    
    if (error.message.includes("not found or access denied")) {
      return sendNotFound(res, error.message);
    }
    
    return sendError(res, "Failed to update post", 500, error.message);
  }
};

const deletePost = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const userId = req.user.userId;
    
    await PostService.deletePost(req.params.id, collegeId, userId);
    
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting post:", error);
    
    if (error.message.includes("not found or access denied")) {
      return sendNotFound(res, error.message);
    }
    
    return sendError(res, "Failed to delete post", 500, error.message);
  }
};

const likePost = async (req, res) => {
    try {
        const userId = req.user.userId;
        const collegeId = req.user.collegeId;
        
        const post = await PostService.likePost(req.params.id, userId, collegeId);
        
        return sendSuccess(res, post, "Post like toggled successfully");
    } catch (error) {
        console.error("Error liking post:", error);
        
        if (error.message.includes("not found or access denied")) {
            return sendNotFound(res, error.message);
        }
        
        return sendError(res, "Failed to like post", 500, error.message);
    }
}

const commentOnPost = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;
        const commentData = {
            user: req.user.userId,
            text: req.body.text
        };
        
        const post = await PostService.commentOnPost(req.params.id, commentData, collegeId);
        
        return sendSuccess(res, post, "Comment added successfully");
    } catch (error) {
        console.error("Error commenting on post:", error);
        
        if (error.message.includes("not found or access denied")) {
            return sendNotFound(res, error.message);
        }
        
        return sendError(res, "Failed to add comment", 500, error.message);
    }
}

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
};
