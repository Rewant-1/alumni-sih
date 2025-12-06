const mongoose = require("mongoose");

const successStorySchema = new mongoose.Schema({
    alumniId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alumni",
        required: true
    },

    // Story content
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 150
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        maxLength: 300
    },
    coverImage: {
        type: String // Cloudinary URL
    },

    // Media gallery
    gallery: [{
        url: String,
        caption: String,
        type: {
            type: String,
            enum: ['image', 'video']
        }
    }],

    // Categorization
    category: {
        type: String,
        enum: ['career', 'entrepreneurship', 'research', 'social-impact', 'achievement', 'other'],
        default: 'career'
    },
    tags: [String],

    // Approval workflow
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
        default: 'draft'
    },
    rejectionReason: String,
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins"
    },
    reviewedAt: Date,

    // Publishing
    publishedAt: Date,
    isFeatured: {
        type: Boolean,
        default: false
    },
    featuredOrder: Number,

    // Engagement
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // SEO
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    metaDescription: {
        type: String,
        maxLength: 160
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate slug from title
successStorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Generate slug if not exists
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }

    // Generate excerpt if not exists
    if (!this.excerpt && this.content) {
        this.excerpt = this.content.substring(0, 297) + '...';
    }

    next();
});

// Virtual for like count
successStorySchema.virtual('likeCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

successStorySchema.virtual('commentCount').get(function () {
    return this.comments ? this.comments.length : 0;
});

successStorySchema.set('toJSON', { virtuals: true });
successStorySchema.set('toObject', { virtuals: true });

// Indexes
successStorySchema.index({ status: 1, publishedAt: -1 });
successStorySchema.index({ alumniId: 1, status: 1 });
successStorySchema.index({ slug: 1 });

const SuccessStoryModel = mongoose.model("SuccessStory", successStorySchema);

module.exports = SuccessStoryModel;
