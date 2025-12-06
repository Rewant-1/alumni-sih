/**
 * Cloudinary Upload Service
 * For handling image and file uploads
 */

const cloudinary = require('cloudinary').v2;

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {string} fileBuffer - Base64 encoded file or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (fileBuffer, options = {}) => {
    try {
        const defaultOptions = {
            folder: 'alumni-network',
            resource_type: 'image',
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' }
            ],
            ...options
        };

        const result = await cloudinary.uploader.upload(fileBuffer, defaultOptions);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        };
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Upload profile picture
 * @param {string} fileBuffer - Base64 encoded image
 * @param {string} userId - User ID for naming
 * @returns {Promise<Object>} Upload result
 */
const uploadProfilePicture = async (fileBuffer, userId) => {
    return await uploadImage(fileBuffer, {
        folder: 'alumni-network/profiles',
        public_id: `profile_${userId}_${Date.now()}`,
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
        ]
    });
};

/**
 * Upload event cover image
 * @param {string} fileBuffer - Base64 encoded image
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Upload result
 */
const uploadEventCover = async (fileBuffer, eventId) => {
    return await uploadImage(fileBuffer, {
        folder: 'alumni-network/events',
        public_id: `event_${eventId}_${Date.now()}`,
        transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto' }
        ]
    });
};

/**
 * Upload campaign cover image
 * @param {string} fileBuffer - Base64 encoded image
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Upload result
 */
const uploadCampaignCover = async (fileBuffer, campaignId) => {
    return await uploadImage(fileBuffer, {
        folder: 'alumni-network/campaigns',
        public_id: `campaign_${campaignId}_${Date.now()}`,
        transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto' }
        ]
    });
};

/**
 * Upload success story cover
 * @param {string} fileBuffer - Base64 encoded image
 * @param {string} storyId - Story ID
 * @returns {Promise<Object>} Upload result
 */
const uploadStoryCover = async (fileBuffer, storyId) => {
    return await uploadImage(fileBuffer, {
        folder: 'alumni-network/stories',
        public_id: `story_${storyId}_${Date.now()}`,
        transformation: [
            { width: 1200, height: 800, crop: 'fill' },
            { quality: 'auto' }
        ]
    });
};

/**
 * Upload company logo
 * @param {string} fileBuffer - Base64 encoded image
 * @param {string} companyName - Company name
 * @returns {Promise<Object>} Upload result
 */
const uploadCompanyLogo = async (fileBuffer, companyName) => {
    const sanitizedName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return await uploadImage(fileBuffer, {
        folder: 'alumni-network/companies',
        public_id: `company_${sanitizedName}_${Date.now()}`,
        transformation: [
            { width: 200, height: 200, crop: 'fit' },
            { quality: 'auto' }
        ]
    });
};

/**
 * Upload resume/document
 * @param {string} fileBuffer - Base64 encoded file
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Upload result
 */
const uploadDocument = async (fileBuffer, userId) => {
    try {
        const result = await cloudinary.uploader.upload(fileBuffer, {
            folder: 'alumni-network/documents',
            public_id: `doc_${userId}_${Date.now()}`,
            resource_type: 'raw'
        });

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Document upload failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>} Delete result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === 'ok',
            result: result.result
        };
    } catch (error) {
        console.error('Cloudinary delete failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generate optimized URL with transformations
 * @param {string} publicId - Public ID
 * @param {Object} transformations - Transformation options
 * @returns {string} Optimized URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            transformations
        ]
    });
};

module.exports = {
    uploadImage,
    uploadProfilePicture,
    uploadEventCover,
    uploadCampaignCover,
    uploadStoryCover,
    uploadCompanyLogo,
    uploadDocument,
    deleteImage,
    getOptimizedUrl
};
