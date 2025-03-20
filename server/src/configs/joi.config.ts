import Joi from 'joi';

export const mongooseId = Joi.string().hex().length(24).required();

export const discountCode = Joi.string().min(6).max(10).required();


export const pageSplitting = Joi.object({
    page: Joi.number(),
    limit: Joi.number()
});
