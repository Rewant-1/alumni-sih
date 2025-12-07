const Post = require("../model/model.post.js");

const createPost = async (postData, collegeId) => {
  try {
    const newPost = new Post({
      ...postData,
      collegeId: collegeId
    });
    const savedPost = await newPost.save();
    return savedPost;
  } catch (error) {
    throw error;
  }
};

const getPosts = async (collegeId, filters = {}) => {
  try {
    // Always filter by collegeId
    const query = { collegeId, ...filters };
    const posts = await Post.find(query)
      .populate("postedBy", "name email")
      .populate("likes", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });
    return posts;
  } catch (error) {
    throw error;
  }
};

const getPostById = async (postId, collegeId) => {
  try {
    // Must match both postId and collegeId
    const post = await Post.findOne({ _id: postId, collegeId })
      .populate("postedBy", "name email")
      .populate("likes", "name email")
      .populate("comments.user", "name email");
    return post;
  } catch (error) {
    throw error;
  }
};

const updatePost = async (postId, postData, collegeId, userId) => {
  try {
    // Find post with college and owner validation
    const post = await Post.findOne({ 
      _id: postId, 
      collegeId,
      postedBy: userId 
    });
    
    if (!post) {
      throw new Error("Post not found or access denied");
    }
    
    Object.assign(post, postData);
    const updatedPost = await post.save();
    return updatedPost;
  } catch (error) {
    throw error;
  }
};

const deletePost = async (postId, collegeId, userId) => {
  try {
    // Only allow deletion if user is owner and from same college
    const deletedPost = await Post.findOneAndDelete({ 
      _id: postId, 
      collegeId,
      postedBy: userId 
    });
    
    if (!deletedPost) {
      throw new Error("Post not found or access denied");
    }
    
    return deletedPost;
  } catch (error) {
    throw error;
  }
};

const likePost = async (postId, userId, collegeId) => {
    try {
        // Validate post belongs to user's college
        const post = await Post.findOne({ _id: postId, collegeId });
        
        if (!post) {
            throw new Error("Post not found or access denied");
        }
        
        if (post.likes.includes(userId)) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }
        await post.save();
        return post;
    } catch (error) {
        throw error;
    }
}

const commentOnPost = async (postId, commentData, collegeId) => {
    try {
        // Validate post belongs to user's college
        const post = await Post.findOne({ _id: postId, collegeId });
        
        if (!post) {
            throw new Error("Post not found or access denied");
        }
        
        post.comments.push(commentData);
        await post.save();
        return post;
    } catch (error) {
        throw error;
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
