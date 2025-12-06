/**
 * Campaign Controller
 * Handles all campaign-related operations
 */

const CampaignModel = require('../model/model.campaign');
const DonationModel = require('../model/model.donation');
const ActivityModel = require('../model/model.activity');
const razorpayService = require('../service/service.razorpay');
const notificationService = require('../service/service.notification');
const cloudinaryService = require('../service/service.cloudinary');

/**
 * Create a new campaign
 */
const createCampaign = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            category,
            goalAmount,
            startDate,
            endDate,
            milestones,
            skillsNeeded,
            tags
        } = req.body;

        const campaign = new CampaignModel({
            title,
            description,
            shortDescription,
            category,
            goalAmount,
            startDate,
            endDate,
            milestones,
            skillsNeeded,
            tags,
            createdBy: req.user._id,
            collegeId: req.user.collegeId,
            status: 'pending' // Goes for approval
        });

        await campaign.save();

        // Log activity
        await ActivityModel.logActivity({
            userId: req.user._id,
            type: 'event_created', // Using similar type
            title: `Created campaign: ${title}`,
            referenceId: campaign._id,
            referenceModel: 'Campaign'
        });

        res.status(201).json({
            success: true,
            message: 'Campaign created and sent for approval',
            data: campaign
        });
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create campaign',
            error: error.message
        });
    }
};

/**
 * Get all campaigns with filters
 */
const getCampaigns = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = 'active',
            category,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const campaigns = await CampaignModel.find(query)
            .populate('createdBy', 'name email')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await CampaignModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: campaigns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaigns',
            error: error.message
        });
    }
};

/**
 * Get campaign by ID
 */
const getCampaignById = async (req, res) => {
    try {
        const { id } = req.params;

        const campaign = await CampaignModel.findById(id)
            .populate('createdBy', 'name email profileDetails');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Get recent donations
        const recentDonations = await DonationModel.find({
            campaignId: id,
            paymentStatus: 'completed'
        })
            .populate('donorId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                ...campaign.toObject(),
                recentDonations
            }
        });
    } catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign',
            error: error.message
        });
    }
};

/**
 * Update campaign
 */
const updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const campaign = await CampaignModel.findById(id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check ownership
        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this campaign'
            });
        }

        // Don't allow updates to active campaigns (except updates field)
        if (campaign.status === 'active' && Object.keys(updates).some(key => key !== 'updates')) {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify active campaign details'
            });
        }

        Object.assign(campaign, updates);
        await campaign.save();

        res.status(200).json({
            success: true,
            message: 'Campaign updated successfully',
            data: campaign
        });
    } catch (error) {
        console.error('Update campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update campaign',
            error: error.message
        });
    }
};

/**
 * Add campaign update/news
 */
const addCampaignUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, image } = req.body;

        const campaign = await CampaignModel.findById(id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        campaign.updates.push({
            title,
            content,
            image
        });

        await campaign.save();

        res.status(200).json({
            success: true,
            message: 'Update added successfully',
            data: campaign.updates[campaign.updates.length - 1]
        });
    } catch (error) {
        console.error('Add update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add update',
            error: error.message
        });
    }
};

/**
 * Upload campaign cover image
 */
const uploadCoverImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { image } = req.body; // Base64 image

        const campaign = await CampaignModel.findById(id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const uploadResult = await cloudinaryService.uploadCampaignCover(image, id);

        if (!uploadResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Image upload failed',
                error: uploadResult.error
            });
        }

        campaign.coverImage = uploadResult.url;
        await campaign.save();

        res.status(200).json({
            success: true,
            message: 'Cover image uploaded',
            data: { coverImage: uploadResult.url }
        });
    } catch (error) {
        console.error('Upload cover error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

/**
 * Get user's campaigns
 */
const getMyCampaigns = async (req, res) => {
    try {
        const campaigns = await CampaignModel.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: campaigns
        });
    } catch (error) {
        console.error('Get my campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaigns',
            error: error.message
        });
    }
};

/**
 * Delete campaign (only drafts)
 */
const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;

        const campaign = await CampaignModel.findById(id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (campaign.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Only draft campaigns can be deleted'
            });
        }

        await CampaignModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Campaign deleted'
        });
    } catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete campaign',
            error: error.message
        });
    }
};

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    addCampaignUpdate,
    uploadCoverImage,
    getMyCampaigns,
    deleteCampaign
};
