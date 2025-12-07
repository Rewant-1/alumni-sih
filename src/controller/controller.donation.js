/**
 * Donation Controller
 * Handles donations for campaigns
 */

const DonationModel = require('../model/model.donation');
const CampaignModel = require('../model/model.campaign');
const ActivityModel = require('../model/model.activity');
const razorpayService = require('../service/service.razorpay');
const notificationService = require('../service/service.notification');
const qrcodeService = require('../service/service.qrcode');

/**
 * Create donation order (Razorpay)
 */
const createDonationOrder = async (req, res) => {
    try {
        const { campaignId, amount, isAnonymous = false, message } = req.body;
        const userCollegeId = req.user.collegeId;

        if (!amount || amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid donation amount'
            });
        }

        const campaign = await CampaignModel.findById(campaignId);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // CRITICAL: Validate campaign belongs to user's college
        if (campaign.collegeId && campaign.collegeId.toString() !== userCollegeId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Cannot donate to campaigns from other colleges'
            });
        }

        if (campaign.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Campaign is not accepting donations'
            });
        }

        // Create Razorpay order
        const orderResult = await razorpayService.createDonationPayment(
            campaign,
            req.user,
            amount
        );

        if (!orderResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create payment order',
                error: orderResult.error
            });
        }

        // Create pending donation record with collegeId
        const donation = new DonationModel({
            campaignId,
            donorId: req.user._id,
            type: 'monetary',
            amount,
            paymentDetails: {
                orderId: orderResult.order.id
            },
            paymentStatus: 'pending',
            isAnonymous,
            message,
            collegeId: userCollegeId
        });

        await donation.save();

        res.status(200).json({
            success: true,
            data: {
                donationId: donation._id,
                order: orderResult.order,
                key: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Create donation order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create donation',
            error: error.message
        });
    }
};

/**
 * Verify donation payment
 */
const verifyDonation = async (req, res) => {
    try {
        const { donationId, paymentId, signature } = req.body;

        const donation = await DonationModel.findById(donationId);

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Verify payment
        const isValid = razorpayService.verifyPayment(
            donation.paymentDetails.orderId,
            paymentId,
            signature
        );

        if (!isValid) {
            donation.paymentStatus = 'failed';
            await donation.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Update donation
        donation.paymentDetails.paymentId = paymentId;
        donation.paymentDetails.signature = signature;
        donation.paymentStatus = 'completed';
        await donation.save();

        // Update campaign
        const campaign = await CampaignModel.findById(donation.campaignId);
        campaign.raisedAmount += donation.amount;
        campaign.donorCount += 1;
        await campaign.save();

        // Log activity
        await ActivityModel.logActivity({
            userId: req.user._id,
            type: 'donation_made',
            title: `Donated ₹${donation.amount} to ${campaign.title}`,
            referenceId: donation._id,
            referenceModel: 'Donation',
            metadata: { amount: donation.amount, campaignId: campaign._id }
        });

        // Send notifications
        await notificationService.notifyDonationThankYou(
            req.user._id,
            campaign,
            donation.amount
        );

        if (campaign.createdBy.toString() !== req.user._id.toString()) {
            await notificationService.notifyDonationReceived(
                campaign.createdBy,
                donation,
                { name: req.user.name, isAnonymous: donation.isAnonymous }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Donation successful',
            data: {
                donation,
                campaign: {
                    raisedAmount: campaign.raisedAmount,
                    progressPercentage: campaign.progressPercentage
                }
            }
        });
    } catch (error) {
        console.error('Verify donation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify donation',
            error: error.message
        });
    }
};

/**
 * Make skill contribution
 */
const contributeSkill = async (req, res) => {
    try {
        const { campaignId, skill, hoursCommitted, description } = req.body;

        const campaign = await CampaignModel.findById(campaignId);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if skill is needed
        const skillNeeded = campaign.skillsNeeded.find(s => s.skill === skill);
        if (!skillNeeded) {
            return res.status(400).json({
                success: false,
                message: 'This skill is not needed for this campaign'
            });
        }

        const donation = new DonationModel({
            campaignId,
            donorId: req.user._id,
            type: 'skill',
            skillDetails: {
                skill,
                hoursCommitted,
                description,
                status: 'committed'
            },
            paymentStatus: 'completed' // No payment for skills
        });

        await donation.save();

        // Update campaign skill hours
        skillNeeded.hoursFulfilled += hoursCommitted;
        await campaign.save();

        // Log activity
        await ActivityModel.logActivity({
            userId: req.user._id,
            type: 'skill_contributed',
            title: `Committed ${hoursCommitted} hours of ${skill} to ${campaign.title}`,
            referenceId: donation._id,
            referenceModel: 'Donation'
        });

        res.status(201).json({
            success: true,
            message: 'Skill contribution registered',
            data: donation
        });
    } catch (error) {
        console.error('Skill contribution error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register contribution',
            error: error.message
        });
    }
};

/**
 * Get user's donations
 */
const getMyDonations = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const donations = await DonationModel.find({
            donorId: req.user._id,
            paymentStatus: 'completed'
        })
            .populate('campaignId', 'title category coverImage')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await DonationModel.countDocuments({
            donorId: req.user._id,
            paymentStatus: 'completed'
        });

        // Calculate total donated
        const totalDonated = await DonationModel.aggregate([
            {
                $match: {
                    donorId: req.user._id,
                    type: 'monetary',
                    paymentStatus: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: donations,
            stats: {
                totalDonated: totalDonated[0]?.total || 0,
                donationCount: total
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donations',
            error: error.message
        });
    }
};

/**
 * Generate donation certificate
 */
const generateCertificate = async (req, res) => {
    try {
        const { id } = req.params;

        const donation = await DonationModel.findById(id)
            .populate('campaignId', 'title category')
            .populate('donorId', 'name email');

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        if (donation.donorId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (donation.paymentStatus !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Certificate available only for completed donations'
            });
        }

        // Generate certificate number if not exists
        if (!donation.certificate.certificateNumber) {
            const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
            donation.certificate.certificateNumber = certNumber;
            donation.certificate.generated = true;
            donation.certificate.generatedAt = new Date();

            // Generate QR for certificate
            const qrResult = await qrcodeService.generateDonationCertificateQR(
                donation,
                certNumber
            );

            if (qrResult.success) {
                donation.certificate.url = qrResult.dataUrl; // Store QR code
            }

            await donation.save();
        }

        res.status(200).json({
            success: true,
            data: {
                certificateNumber: donation.certificate.certificateNumber,
                donorName: donation.donorId.name,
                amount: donation.amount,
                campaignTitle: donation.campaignId.title,
                date: donation.createdAt,
                qrCode: donation.certificate.url
            }
        });
    } catch (error) {
        console.error('Generate certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate certificate',
            error: error.message
        });
    }
};

/**
 * Get campaign donors (for campaign owner)
 */
const getCampaignDonors = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const campaign = await CampaignModel.findById(campaignId);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        const donations = await DonationModel.find({
            campaignId,
            paymentStatus: 'completed'
        })
            .populate('donorId', 'name email profileDetails')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Hide donor info for anonymous donations
        const processedDonations = donations.map(d => {
            if (d.isAnonymous) {
                return {
                    ...d.toObject(),
                    donorId: { name: 'Anonymous' }
                };
            }
            return d;
        });

        res.status(200).json({
            success: true,
            data: processedDonations
        });
    } catch (error) {
        console.error('Get donors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donors',
            error: error.message
        });
    }
};

/**
 * Get donation impact stats
 */
const getDonationImpact = async (req, res) => {
    try {
        const stats = await DonationModel.aggregate([
            {
                $match: {
                    donorId: req.user._id,
                    paymentStatus: 'completed'
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalHours: { $sum: '$skillDetails.hoursCommitted' }
                }
            }
        ]);

        const campaignsSupported = await DonationModel.distinct('campaignId', {
            donorId: req.user._id,
            paymentStatus: 'completed'
        });

        res.status(200).json({
            success: true,
            data: {
                breakdown: stats,
                campaignsSupported: campaignsSupported.length
            }
        });
    } catch (error) {
        console.error('Get impact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch impact stats',
            error: error.message
        });
    }
};

module.exports = {
    createDonationOrder,
    verifyDonation,
    contributeSkill,
    getMyDonations,
    generateCertificate,
    getCampaignDonors,
    getDonationImpact
};
