/**
 * Alumni Card Controller
 * Handles alumni card generation and verification
 */

const AlumniCardModel = require('../model/model.alumniCard');
const AlumniModel = require('../model/model.alumni');
const UserModel = require('../model/model.user');
const ActivityModel = require('../model/model.activity');
const qrcodeService = require('../service/service.qrcode');
const notificationService = require('../service/service.notification');

/**
 * Get current user's alumni card
 */
const getMyCard = async (req, res) => {
    try {
        const card = await AlumniCardModel.findOne({ userId: req.user._id })
            .populate({
                path: 'alumniId',
                select: 'photo graduationYear department degree',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Alumni card not found. Please generate one.',
                hasCard: false
            });
        }

        res.status(200).json({
            success: true,
            data: card
        });
    } catch (error) {
        console.error('Get card error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch card',
            error: error.message
        });
    }
};

/**
 * Generate alumni card
 */
const generateCard = async (req, res) => {
    try {
        const alumni = await AlumniModel.findOne({ userId: req.user._id })
            .populate('userId', 'name email collegeId');

        if (!alumni) {
            return res.status(400).json({
                success: false,
                message: 'Alumni profile not found'
            });
        }

        if (!alumni.verified) {
            return res.status(400).json({
                success: false,
                message: 'Alumni profile must be verified to generate card'
            });
        }

        // Check if card already exists
        let existingCard = await AlumniCardModel.findOne({ alumniId: alumni._id });

        if (existingCard && existingCard.status === 'active') {
            return res.status(400).json({
                success: false,
                message: 'Active card already exists',
                data: existingCard
            });
        }

        // Generate card number
        const cardNumber = await AlumniCardModel.generateCardNumber('ALM');

        // Calculate validity (5 years from now)
        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 5);

        // Create or update card
        const cardData = {
            alumniId: alumni._id,
            userId: req.user._id,
            cardNumber,
            validUntil,
            status: 'active',
            cardType: 'digital'
        };

        let card;
        if (existingCard) {
            Object.assign(existingCard, cardData);
            card = existingCard;
        } else {
            card = new AlumniCardModel(cardData);
        }

        // Generate QR code
        const qrResult = await qrcodeService.generateAlumniCardQR(
            { ...alumni.toObject(), name: alumni.userId.name },
            cardNumber
        );

        if (qrResult.success) {
            card.qrCode = {
                data: qrResult.dataUrl,
                generatedAt: new Date()
            };
        }

        await card.save();

        // Log activity
        await ActivityModel.logActivity({
            userId: req.user._id,
            type: 'card_generated',
            title: 'Generated digital alumni card',
            referenceId: card._id,
            referenceModel: 'AlumniCard'
        });

        // Send notification
        await notificationService.notifyCardIssued(req.user._id, card);

        res.status(201).json({
            success: true,
            message: 'Alumni card generated successfully',
            data: card
        });
    } catch (error) {
        console.error('Generate card error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate card',
            error: error.message
        });
    }
};

/**
 * Verify alumni card (public endpoint)
 */
const verifyCard = async (req, res) => {
    try {
        const { cardNumber } = req.params;

        const card = await AlumniCardModel.findOne({ cardNumber })
            .populate({
                path: 'alumniId',
                select: 'photo graduationYear department degree verified',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            });

        if (!card) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: 'Card not found'
            });
        }

        // Check validity
        const isExpired = new Date() > card.validUntil;
        const isValid = card.status === 'active' && !isExpired;

        // Log usage
        card.lastUsedAt = new Date();
        card.usageCount += 1;
        card.usageHistory.push({
            action: 'verification',
            location: req.headers['x-forwarded-for'] || req.ip,
            timestamp: new Date()
        });
        await card.save();

        res.status(200).json({
            success: true,
            valid: isValid,
            data: {
                cardNumber: card.cardNumber,
                status: isExpired ? 'expired' : card.status,
                holderName: card.alumniId?.userId?.name,
                graduationYear: card.alumniId?.graduationYear,
                department: card.alumniId?.department,
                validUntil: card.validUntil,
                isVerifiedAlumni: card.alumniId?.verified
            }
        });
    } catch (error) {
        console.error('Verify card error:', error);
        res.status(500).json({
            success: false,
            valid: false,
            message: 'Verification failed',
            error: error.message
        });
    }
};

/**
 * Link NFC tag to card
 */
const linkNFC = async (req, res) => {
    try {
        const { nfcTagId } = req.body;

        const card = await AlumniCardModel.findOne({ userId: req.user._id });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }

        // Check if NFC tag is already used
        const existingNFC = await AlumniCardModel.findOne({ 'nfc.tagId': nfcTagId });
        if (existingNFC && existingNFC._id.toString() !== card._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'NFC tag already linked to another card'
            });
        }

        card.nfc = {
            tagId: nfcTagId,
            enabled: true,
            linkedAt: new Date()
        };
        card.cardType = 'both';

        await card.save();

        res.status(200).json({
            success: true,
            message: 'NFC tag linked successfully',
            data: card.nfc
        });
    } catch (error) {
        console.error('Link NFC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to link NFC',
            error: error.message
        });
    }
};

/**
 * Verify via NFC tag
 */
const verifyNFC = async (req, res) => {
    try {
        const { nfcTagId } = req.params;

        const card = await AlumniCardModel.findOne({ 'nfc.tagId': nfcTagId })
            .populate({
                path: 'alumniId',
                select: 'photo graduationYear department degree verified',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            });

        if (!card || !card.nfc.enabled) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: 'NFC tag not found or disabled'
            });
        }

        const isExpired = new Date() > card.validUntil;
        const isValid = card.status === 'active' && !isExpired;

        // Log usage
        card.lastUsedAt = new Date();
        card.usageCount += 1;
        card.usageHistory.push({
            action: 'access',
            location: req.headers['x-forwarded-for'] || req.ip,
            timestamp: new Date()
        });
        await card.save();

        res.status(200).json({
            success: true,
            valid: isValid,
            data: {
                cardNumber: card.cardNumber,
                status: isExpired ? 'expired' : card.status,
                holderName: card.alumniId?.userId?.name,
                graduationYear: card.alumniId?.graduationYear,
                department: card.alumniId?.department
            }
        });
    } catch (error) {
        console.error('Verify NFC error:', error);
        res.status(500).json({
            success: false,
            valid: false,
            message: 'NFC verification failed',
            error: error.message
        });
    }
};

/**
 * Request physical card
 */
const requestPhysicalCard = async (req, res) => {
    try {
        const { deliveryAddress } = req.body;

        const card = await AlumniCardModel.findOne({ userId: req.user._id });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Digital card not found. Generate digital card first.'
            });
        }

        if (card.physicalCard.requested) {
            return res.status(400).json({
                success: false,
                message: 'Physical card already requested',
                data: card.physicalCard
            });
        }

        card.physicalCard = {
            requested: true,
            requestedAt: new Date(),
            deliveryAddress
        };
        card.cardType = card.cardType === 'digital' ? 'both' : card.cardType;

        await card.save();

        res.status(200).json({
            success: true,
            message: 'Physical card requested. You will receive updates on delivery.',
            data: card.physicalCard
        });
    } catch (error) {
        console.error('Request physical card error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to request physical card',
            error: error.message
        });
    }
};

/**
 * Get card usage history
 */
const getUsageHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const card = await AlumniCardModel.findOne({ userId: req.user._id });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }

        const history = card.usageHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice((page - 1) * limit, page * limit);

        res.status(200).json({
            success: true,
            data: {
                totalUsage: card.usageCount,
                lastUsed: card.lastUsedAt,
                history
            }
        });
    } catch (error) {
        console.error('Get usage history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history',
            error: error.message
        });
    }
};

/**
 * Regenerate QR code
 */
const regenerateQR = async (req, res) => {
    try {
        const card = await AlumniCardModel.findOne({ userId: req.user._id });

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }

        const alumni = await AlumniModel.findById(card.alumniId)
            .populate('userId', 'name');

        const qrResult = await qrcodeService.generateAlumniCardQR(
            { ...alumni.toObject(), name: alumni.userId.name },
            card.cardNumber
        );

        if (!qrResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate QR code'
            });
        }

        card.qrCode = {
            data: qrResult.dataUrl,
            generatedAt: new Date()
        };

        await card.save();

        res.status(200).json({
            success: true,
            message: 'QR code regenerated',
            data: { qrCode: card.qrCode }
        });
    } catch (error) {
        console.error('Regenerate QR error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate QR',
            error: error.message
        });
    }
};

module.exports = {
    getMyCard,
    generateCard,
    verifyCard,
    linkNFC,
    verifyNFC,
    requestPhysicalCard,
    getUsageHistory,
    regenerateQR
};
