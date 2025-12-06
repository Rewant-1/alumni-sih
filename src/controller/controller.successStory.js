/**
 * Success Story Controller
 * Handles success story submissions and management
 */

const SuccessStoryModel = require('../model/model.successStory');
const ActivityModel = require('../model/model.activity');
const AlumniModel = require('../model/model.alumni');
const notificationService = require('../service/service.notification');
const cloudinaryService = require('../service/service.cloudinary');
const geminiService = require('../service/service.gemini');

/**
 * Submit a new success story
 */
const submitStory = async (req, res) => {
    try {
        const { title, content, category, tags, coverImage } = req.body;

        // Get alumni profile
        const alumni = await AlumniModel.findOne({ userId: req.user._id });

        if (!alumni) {
            return res.status(400).json({
                success: false,
                message: 'Alumni profile not found'
            });
        }

        const story = new SuccessStoryModel({
            alumniId: alumni._id,
            title,
            content,
            category,
            tags,
            status: 'pending'
        });

        // Upload cover image if provided
        if (coverImage) {
            const uploadResult = await cloudinaryService.uploadStoryCover(coverImage, story._id.toString());
            if (uploadResult.success) {
                story.coverImage = uploadResult.url;
            }
        }

        // Generate excerpt using AI if content is long
        if (content.length > 300) {
            const summaryResult = await geminiService.generateStorySummary(content);
            if (summaryResult.success) {
                story.excerpt = summaryResult.summary.substring(0, 300);
            }
        }

        await story.save();

        // Log activity
        await ActivityModel.logActivity({
            userId: req.user._id,
            type: 'story_submitted',
            title: `Submitted success story: ${title}`,
            referenceId: story._id,
            referenceModel: 'SuccessStory'
        });

        res.status(201).json({
            success: true,
            message: 'Story submitted for approval',
            data: story
        });
    } catch (error) {
        console.error('Submit story error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit story',
            error: error.message
        });
    }
};

/**
 * Save story as draft
 */
const saveAsDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, tags, coverImage } = req.body;

        const alumni = await AlumniModel.findOne({ userId: req.user._id });

        let story;

        if (id) {
            // Update existing draft
            story = await SuccessStoryModel.findById(id);

            if (!story) {
                return res.status(404).json({
                    success: false,
                    message: 'Story not found'
                });
            }

            if (story.alumniId.toString() !== alumni._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized'
                });
            }

            if (story.status !== 'draft') {
                return res.status(400).json({
                    success: false,
                    message: 'Can only update drafts'
                });
            }

            Object.assign(story, { title, content, category, tags });
        } else {
            // Create new draft
            story = new SuccessStoryModel({
                alumniId: alumni._id,
                title,
                content,
                category,
                tags,
                status: 'draft'
            });
        }

        // Upload cover if provided
        if (coverImage) {
            const uploadResult = await cloudinaryService.uploadStoryCover(coverImage, story._id.toString());
            if (uploadResult.success) {
                story.coverImage = uploadResult.url;
            }
        }

        await story.save();

        res.status(200).json({
            success: true,
            message: 'Draft saved',
            data: story
        });
    } catch (error) {
        console.error('Save draft error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save draft',
            error: error.message
        });
    }
};

/**
 * Get all published stories
 */
const getStories = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            search,
            featured
        } = req.query;

        const query = { status: 'approved' };

        if (category) query.category = category;
        if (featured === 'true') query.isFeatured = true;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const stories = await SuccessStoryModel.find(query)
            .populate({
                path: 'alumniId',
                select: 'photo headline graduationYear department',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            })
            .select('-content') // Don't include full content in listing
            .sort({ publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await SuccessStoryModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: stories,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get stories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stories',
            error: error.message
        });
    }
};

/**
 * Get story by slug or ID
 */
const getStory = async (req, res) => {
    try {
        const { idOrSlug } = req.params;

        let query;
        if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: idOrSlug };
        } else {
            query = { slug: idOrSlug };
        }

        const story = await SuccessStoryModel.findOne(query)
            .populate({
                path: 'alumniId',
                select: 'photo headline graduationYear department bio socialLinks experience',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            });

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Only show approved stories to public
        if (story.status !== 'approved') {
            // Check if requesting user is the author
            const alumni = await AlumniModel.findOne({ userId: req.user?._id });
            if (!alumni || story.alumniId._id.toString() !== alumni._id.toString()) {
                return res.status(404).json({
                    success: false,
                    message: 'Story not found'
                });
            }
        }

        // Increment views
        story.views += 1;
        await story.save();

        res.status(200).json({
            success: true,
            data: story
        });
    } catch (error) {
        console.error('Get story error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch story',
            error: error.message
        });
    }
};

/**
 * Get user's drafts
 */
const getMyDrafts = async (req, res) => {
    try {
        const alumni = await AlumniModel.findOne({ userId: req.user._id });

        if (!alumni) {
            return res.status(400).json({
                success: false,
                message: 'Alumni profile not found'
            });
        }

        const drafts = await SuccessStoryModel.find({
            alumniId: alumni._id,
            status: { $in: ['draft', 'pending', 'rejected'] }
        }).sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: drafts
        });
    } catch (error) {
        console.error('Get drafts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch drafts',
            error: error.message
        });
    }
};

/**
 * Get user's published stories
 */
const getMyStories = async (req, res) => {
    try {
        const alumni = await AlumniModel.findOne({ userId: req.user._id });

        if (!alumni) {
            return res.status(400).json({
                success: false,
                message: 'Alumni profile not found'
            });
        }

        const stories = await SuccessStoryModel.find({
            alumniId: alumni._id,
            status: 'approved'
        }).sort({ publishedAt: -1 });

        res.status(200).json({
            success: true,
            data: stories
        });
    } catch (error) {
        console.error('Get my stories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stories',
            error: error.message
        });
    }
};

/**
 * Like a story
 */
const likeStory = async (req, res) => {
    try {
        const { id } = req.params;

        const story = await SuccessStoryModel.findById(id);

        if (!story || story.status !== 'approved') {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Check if already liked
        const existingLike = story.likes.find(
            l => l.userId.toString() === req.user._id.toString()
        );

        if (existingLike) {
            // Unlike
            story.likes = story.likes.filter(
                l => l.userId.toString() !== req.user._id.toString()
            );
        } else {
            // Like
            story.likes.push({ userId: req.user._id });
        }

        await story.save();

        res.status(200).json({
            success: true,
            data: {
                liked: !existingLike,
                likeCount: story.likes.length
            }
        });
    } catch (error) {
        console.error('Like story error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update like',
            error: error.message
        });
    }
};

/**
 * Comment on a story
 */
const commentOnStory = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const story = await SuccessStoryModel.findById(id);

        if (!story || story.status !== 'approved') {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        story.comments.push({
            userId: req.user._id,
            content
        });

        await story.save();

        res.status(201).json({
            success: true,
            message: 'Comment added',
            data: story.comments[story.comments.length - 1]
        });
    } catch (error) {
        console.error('Comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message
        });
    }
};

/**
 * Delete draft story
 */
const deleteDraft = async (req, res) => {
    try {
        const { id } = req.params;

        const alumni = await AlumniModel.findOne({ userId: req.user._id });
        const story = await SuccessStoryModel.findById(id);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        if (story.alumniId.toString() !== alumni._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (story.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete published stories'
            });
        }

        await SuccessStoryModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Story deleted'
        });
    } catch (error) {
        console.error('Delete story error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete story',
            error: error.message
        });
    }
};

/**
 * Submit draft for approval
 */
const submitDraftForApproval = async (req, res) => {
    try {
        const { id } = req.params;

        const alumni = await AlumniModel.findOne({ userId: req.user._id });
        const story = await SuccessStoryModel.findById(id);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        if (story.alumniId.toString() !== alumni._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (story.status !== 'draft' && story.status !== 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Story is already submitted'
            });
        }

        story.status = 'pending';
        await story.save();

        res.status(200).json({
            success: true,
            message: 'Story submitted for approval',
            data: story
        });
    } catch (error) {
        console.error('Submit for approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit story',
            error: error.message
        });
    }
};

module.exports = {
    submitStory,
    saveAsDraft,
    getStories,
    getStory,
    getMyDrafts,
    getMyStories,
    likeStory,
    commentOnStory,
    deleteDraft,
    submitDraftForApproval
};
