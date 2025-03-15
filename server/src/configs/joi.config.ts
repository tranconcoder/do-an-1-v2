import Joi from 'joi';

export const mongooseId = Joi.string().hex().length(24).required();

export const pageSplitting = Joi.object({
    page: Joi.number(),
    limit: Joi.number()
});
