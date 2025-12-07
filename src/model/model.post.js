const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  image: { type: String },

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // College isolation
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admins",
    required: true,
    index: true
  },
  
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient college-based queries
postSchema.index({ collegeId: 1, createdAt: -1 });
postSchema.index({ collegeId: 1, postedBy: 1 });

module.exports = mongoose.model("Post", postSchema);