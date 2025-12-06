/**
 * QR Code Generation Service
 * For alumni cards and event tickets
 */

const QRCode = require('qrcode');

/**
 * Generate QR code as data URL
 * @param {string} data - Data to encode in QR
 * @param {Object} options - QR code options
 * @returns {Promise<string>} QR code as data URL
 */
const generateQRDataURL = async (data, options = {}) => {
    const defaultOptions = {
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        },
        ...options
    };

    try {
        const qrDataUrl = await QRCode.toDataURL(data, defaultOptions);
        return {
            success: true,
            dataUrl: qrDataUrl
        };
    } catch (error) {
        console.error('QR generation failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generate QR code as buffer (for file saving)
 * @param {string} data - Data to encode
 * @param {Object} options - QR code options
 * @returns {Promise<Buffer>} QR code as buffer
 */
const generateQRBuffer = async (data, options = {}) => {
    const defaultOptions = {
        type: 'png',
        width: 300,
        margin: 2,
        ...options
    };

    try {
        const buffer = await QRCode.toBuffer(data, defaultOptions);
        return {
            success: true,
            buffer
        };
    } catch (error) {
        console.error('QR buffer generation failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generate QR for alumni card
 * @param {Object} alumni - Alumni object
 * @param {string} cardNumber - Card number
 * @returns {Promise<Object>} QR code result
 */
const generateAlumniCardQR = async (alumni, cardNumber) => {
    const qrData = JSON.stringify({
        type: 'alumni_card',
        cardNumber,
        alumniId: alumni._id.toString(),
        name: alumni.name || 'Alumni',
        validationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/card/${cardNumber}`
    });

    return await generateQRDataURL(qrData, {
        width: 400,
        color: {
            dark: '#1a365d', // Dark blue
            light: '#ffffff'
        }
    });
};

/**
 * Generate QR for event ticket
 * @param {Object} event - Event object
 * @param {Object} user - User object
 * @param {string} ticketNumber - Ticket number
 * @returns {Promise<Object>} QR code result
 */
const generateEventTicketQR = async (event, user, ticketNumber) => {
    const qrData = JSON.stringify({
        type: 'event_ticket',
        ticketNumber,
        eventId: event._id.toString(),
        eventTitle: event.title,
        userId: user._id.toString(),
        userName: user.name,
        eventDate: event.date,
        checkInUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}/checkin/${ticketNumber}`
    });

    return await generateQRDataURL(qrData, {
        width: 350,
        color: {
            dark: '#2d3748', // Dark gray
            light: '#ffffff'
        }
    });
};

/**
 * Verify QR code data
 * @param {string} qrData - QR code data string
 * @returns {Object} Parsed QR data
 */
const parseQRData = (qrData) => {
    try {
        const parsed = JSON.parse(qrData);
        return {
            success: true,
            data: parsed
        };
    } catch (error) {
        return {
            success: false,
            error: 'Invalid QR code data'
        };
    }
};

/**
 * Generate donation certificate QR
 * @param {Object} donation - Donation object
 * @param {string} certificateNumber - Certificate number
 * @returns {Promise<Object>} QR code result
 */
const generateDonationCertificateQR = async (donation, certificateNumber) => {
    const qrData = JSON.stringify({
        type: 'donation_certificate',
        certificateNumber,
        donationId: donation._id.toString(),
        amount: donation.amount,
        date: donation.createdAt,
        verifyUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/donation/${certificateNumber}`
    });

    return await generateQRDataURL(qrData, {
        width: 200
    });
};

module.exports = {
    generateQRDataURL,
    generateQRBuffer,
    generateAlumniCardQR,
    generateEventTicketQR,
    generateDonationCertificateQR,
    parseQRData
};
