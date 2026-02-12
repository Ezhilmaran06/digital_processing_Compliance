import Joi from 'joi';

/**
 * Validation schemas for authentication
 */

export const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
    }),
    email: Joi.string().email().trim().lowercase().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
    }),
    password: Joi.string().min(8).max(128).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Please confirm your password',
    }),
    role: Joi.string().valid('Employee', 'Manager', 'Admin', 'Client').required().messages({
        'any.only': 'Invalid role selected',
        'string.empty': 'Role is required',
    }),
});

export const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
    }),
    email: Joi.string().email().trim().lowercase().messages({
        'string.email': 'Please provide a valid email',
    }),
}).min(1);

export const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'string.empty': 'Current password is required',
    }),
    newPassword: Joi.string().min(8).max(128).required().messages({
        'string.empty': 'New password is required',
        'string.min': 'New password must be at least 8 characters',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Please confirm your new password',
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
    }),
    role: Joi.string().valid('Employee', 'Manager', 'Admin', 'Client').required().messages({
        'any.only': 'Invalid role selected',
        'string.empty': 'Role is required',
    }),
});

/**
 * Middleware to validate request body
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            res.status(400);
            throw new Error(errors.join(', '));
        }

        next();
    };
};
