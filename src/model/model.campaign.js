const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        maxLength: 200
    },
    coverImage: {
        type: String // Cloudinary URL
    },
    category: {
        type: String,
        enum: ['infrastructure', 'scholarship', 'research', 'events', 'sports', 'library', 'other'],
        required: true
    },

    // Funding
    goalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    raisedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    donorCount: {
        type: Number,
        default: 0
    },

    // Timeline
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },

    // Milestones
    milestones: [{
        title: {
            type: String,
            required: true
        },
        targetAmount: {
            type: Number,
            required: true
        },
        achieved: {
            type: Boolean,
            default: false
        },
        achievedAt: Date,
        description: String
    }],

    // Skill-based contributions
    skillsNeeded: [{
        skill: String,
        description: String,
        hoursNeeded: Number,
        hoursFulfilled: {
            type: Number,
            default: 0
        }
    }],

    // Updates/News
    updates: [{
        title: String,
        content: String,
        image: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Creator and approval
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins"
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'active', 'completed', 'cancelled'],
        default: 'draft'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins"
    },
    approvedAt: Date,

    // Featured
    isFeatured: {
        type: Boolean,
        default: false
    },

    // Tags for search
    tags: [String],

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update milestones when raised amount changes
campaignSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Auto-update milestone status
    if (this.milestones && this.milestones.length > 0) {
        this.milestones.forEach(milestone => {
            if (!milestone.achieved && this.raisedAmount >= milestone.targetAmount) {
                milestone.achieved = true;
                milestone.achievedAt = new Date();
            }
        });
    }

    // Mark as completed if goal reached
    if (this.raisedAmount >= this.goalAmount && this.status === 'active') {
        this.status = 'completed';
    }

    next();
});

// Virtual for progress percentage
campaignSchema.virtual('progressPercentage').get(function () {
    if (this.goalAmount === 0) return 0;
    return Math.min(100, Math.round((this.raisedAmount / this.goalAmount) * 100));
});

// Ensure virtuals are included in JSON
campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

// Index for search
campaignSchema.index({ status: 1, category: 1, startDate: -1 });

const CampaignModel = mongoose.model("Campaign", campaignSchema);

module.exports = CampaignModel;
