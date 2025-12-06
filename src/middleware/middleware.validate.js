/**
 * Validation Middleware
 * Validates request data against Joi schemas
 */
const { sendValidationError } = require("../../utils/response");

/**
 * Create validation middleware
 * @param {Object} schema - Joi schema
 * @param {string} property - Request property to validate (body, query, params)
 */
const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));
            return sendValidationError(res, errors);
        }

        // Replace request property with validated value
        req[property] = value;
        next();
    };
};

module.exports = validate;
