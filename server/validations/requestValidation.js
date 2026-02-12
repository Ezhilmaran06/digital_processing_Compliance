import Joi from 'joi';

/**
 * Validation schema for creating change requests
 */
export const createRequestSchema = Joi.object({
    title: Joi.string().trim().min(5).max(200).required().messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title cannot exceed 200 characters',
    }),
    description: Joi.string().trim().min(5).max(2000).required().messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 5 characters',
        'string.max': 'Description cannot exceed 2000 characters',
    }),
    changeType: Joi.string()
        .valid('Infrastructure', 'Application', 'Database', 'Network', 'Security', 'Other')
        .required()
        .messages({
            'any.only': 'Invalid change type',
            'string.empty': 'Change type is required',
        }),
    riskLevel: Joi.string()
        .valid('Low', 'Medium', 'High', 'Critical')
        .required()
        .messages({
            'any.only': 'Invalid risk level',
            'string.empty': 'Risk level is required',
        }),
    environment: Joi.string()
        .valid('Development', 'Staging', 'Production', 'All')
        .required()
        .messages({
            'any.only': 'Invalid environment',
            'string.empty': 'Environment is required',
        }),
    plannedStartDate: Joi.date().iso().required().messages({
        'date.base': 'Planned start date must be a valid date',
        'any.required': 'Planned start date is required',
    }),
    plannedEndDate: Joi.date().iso().min(Joi.ref('plannedStartDate')).required().messages({
        'date.base': 'Planned end date must be a valid date',
        'date.min': 'Planned end date must be after start date',
        'any.required': 'Planned end date is required',
    }),
    implementationPlan: Joi.string().trim().min(5).max(5000).required().messages({
        'string.empty': 'Implementation plan is required',
        'string.min': 'Implementation plan must be at least 5 characters',
    }),
    rollbackPlan: Joi.string().trim().min(5).max(5000).required().messages({
        'string.empty': 'Rollback plan is required',
        'string.min': 'Rollback plan must be at least 5 characters',
    }),
    testingPlan: Joi.string().trim().min(5).max(5000).required().messages({
        'string.empty': 'Testing plan is required',
        'string.min': 'Testing plan must be at least 5 characters',
    }),
    justification: Joi.string().trim().max(2000).allow('').optional(),
    impactAssessment: Joi.string().trim().max(2000).allow('').optional(),
    affectedDepartments: Joi.array().items(Joi.string().trim()).optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
    attachments: Joi.array().items(Joi.object()).optional(),
}).unknown(true);

/**
 * Validation schema for updating requests (partial update)
 */
export const updateRequestSchema = Joi.object({
    title: Joi.string().trim().min(5).max(200).optional().messages({
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title cannot exceed 200 characters',
    }),
    description: Joi.string().trim().min(5).max(2000).optional().messages({
        'string.min': 'Description must be at least 5 characters',
        'string.max': 'Description cannot exceed 2000 characters',
    }),
    changeType: Joi.string()
        .valid('Infrastructure', 'Application', 'Database', 'Network', 'Security', 'Other')
        .optional()
        .messages({
            'any.only': 'Invalid change type',
        }),
    riskLevel: Joi.string()
        .valid('Low', 'Medium', 'High', 'Critical')
        .optional()
        .messages({
            'any.only': 'Invalid risk level',
        }),
    environment: Joi.string()
        .valid('Development', 'Staging', 'Production', 'All')
        .optional()
        .messages({
            'any.only': 'Invalid environment',
        }),
    plannedStartDate: Joi.date().iso().optional().messages({
        'date.base': 'Planned start date must be a valid date',
    }),
    plannedEndDate: Joi.date().iso().optional().messages({
        'date.base': 'Planned end date must be a valid date',
    }),
    implementationPlan: Joi.string().trim().min(5).max(5000).optional().messages({
        'string.min': 'Implementation plan must be at least 5 characters',
    }),
    rollbackPlan: Joi.string().trim().min(5).max(5000).optional().messages({
        'string.min': 'Rollback plan must be at least 5 characters',
    }),
    testingPlan: Joi.string().trim().min(5).max(5000).optional().messages({
        'string.min': 'Testing plan must be at least 5 characters',
    }),
    justification: Joi.string().trim().max(2000).allow('').optional(),
    impactAssessment: Joi.string().trim().max(2000).allow('').optional(),
    affectedDepartments: Joi.array().items(Joi.string().trim()).optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
    attachments: Joi.array().items(Joi.object()).optional(),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

/**
 * Validation schema for updating request status
 */
export const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid('Approved', 'Rejected', 'In Progress', 'Completed', 'Cancelled')
        .required()
        .messages({
            'any.only': 'Invalid status',
            'string.empty': 'Status is required',
        }),
    rejectionReason: Joi.when('status', {
        is: 'Rejected',
        then: Joi.string().trim().min(10).max(1000).required().messages({
            'string.empty': 'Rejection reason is required when rejecting a request',
            'string.min': 'Rejection reason must be at least 10 characters',
        }),
        otherwise: Joi.optional(),
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
            const receivedKeys = Object.keys(req.body).join(', ');
            res.status(400);
            return next(new Error(`${errors.join(', ')} (Received keys: ${receivedKeys})`));
        }

        next();
    };
};
