/**
 * Standard Response Utilities
 * Ensures consistent API response format across all endpoints
 */

/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message,
    });
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {any} error - Additional error details (only in development)
 */
const sendError = (res, message = "Internal server error", statusCode = 500, error = null) => {
    const response = {
        success: false,
        message,
    };

    // Include error details only in development
    if (process.env.NODE_ENV === 'development' && error) {
        response.error = error;
    }

    return res.status(statusCode).json(response);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} items - Array of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 */
const sendPaginated = (res, items, total, page, limit, message = "Success") => {
    return res.status(200).json({
        success: true,
        data: items,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
        message,
    });
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {any} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = "Resource created successfully") => {
    return sendSuccess(res, data, message, 201);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
    return res.status(204).send();
};

/**
 * Bad request error (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendBadRequest = (res, message = "Bad request") => {
    return sendError(res, message, 400);
};

/**
 * Unauthorized error (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorized = (res, message = "Unauthorized") => {
    return sendError(res, message, 401);
};

/**
 * Forbidden error (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendForbidden = (res, message = "Forbidden") => {
    return sendError(res, message, 403);
};

/**
 * Not found error (404)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendNotFound = (res, message = "Resource not found") => {
    return sendError(res, message, 404);
};

/**
 * Validation error (422)
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
const sendValidationError = (res, errors) => {
    return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors,
    });
};

module.exports = {
    sendSuccess,
    sendError,
    sendPaginated,
    sendCreated,
    sendNoContent,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendValidationError,
};
