/**
 * Simple email validation utility - Database-only validation
 * No external API calls or disposable email checks
 * Only basic email format validation is performed
 */

/**
 * Simple email format validation - Database-only approach
 * No external API calls, no disposable email checks
 * Only basic format validation is performed
 * 
 * @param {string} email - Email address to check
 * @returns {boolean} - Always returns false (no disposable email checks)
 */
export const isDisposableEmail = async (email) => {
    // Always return false - we don't check for disposable emails
    // All email validation is done through database checks only
    return false;
};

/**
 * Basic email format validation only
 * @param {string} email - Email address to validate
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
export const validateEmail = async (email) => {
    try {
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            return {
                isValid: false,
                message: 'Please provide a valid email address'
            };
        }

        // No disposable email checks - all emails are accepted if format is valid
        return {
            isValid: true,
            message: 'Email format is valid'
        };

    } catch (error) {
        console.error('Email validation error:', error);
        return {
            isValid: false,
            message: 'Unable to validate email address'
        };
    }
};

/**
 * Enhanced email validation (simplified - same as basic validation)
 * @param {string} email - Email address to validate
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
export const validateEmailEnhanced = async (email) => {
    // Simply call the basic validation - no enhanced features
    return await validateEmail(email);
};

export default {
    isDisposableEmail,
    validateEmail,
    validateEmailEnhanced
};