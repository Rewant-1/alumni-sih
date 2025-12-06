const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    graduationYear: {
        type: Number,
        required: true,
    },
    degreeUrl: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
    },

    // Profile Enhancement
    photo: {
        type: String, // Cloudinary URL
    },
    bio: {
        type: String,
        maxLength: 500,
    },
    headline: {
        type: String,
        maxLength: 100,
    },
    department: {
        type: String,
    },
    degree: {
        type: String,
    },

    // Journey Timeline
    timeline: [{
        type: {
            type: String,
            enum: ['education', 'work', 'achievement', 'milestone']
        },
        title: String,
        organization: String,
        startDate: Date,
        endDate: Date,
        description: String,
        icon: String
    }],

    // Social Links
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
        portfolio: String
    },

    // Experience
    experience: [{
        title: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        location: String,
        startDate: Date,
        endDate: Date,
        current: {
            type: Boolean,
            default: false
        },
        description: String,
        employmentType: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance']
        }
    }],

    // Education
    education: [{
        degree: {
            type: String,
            required: true
        },
        institution: {
            type: String,
            required: true
        },
        field: String,
        startYear: Number,
        endYear: Number,
        grade: String,
        description: String
    }],

    // Location for map view
    location: {
        city: String,
        state: String,
        country: {
            type: String,
            default: 'India'
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },

    // Privacy settings
    privacySettings: {
        showEmail: {
            type: Boolean,
            default: false
        },
        showPhone: {
            type: Boolean,
            default: false
        },
        showLocation: {
            type: Boolean,
            default: true
        },
        profileVisibility: {
            type: String,
            enum: ['public', 'alumni-only', 'connections-only'],
            default: 'public'
        }
    },

    // Stats
    profileViews: {
        type: Number,
        default: 0
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

// Update the updatedAt field before saving
alumniSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for search
alumniSchema.index({
    'location.city': 1,
    'location.state': 1,
    department: 1,
    graduationYear: 1
});

const AlumniModel = mongoose.model("Alumni", alumniSchema);

module.exports = AlumniModel;
