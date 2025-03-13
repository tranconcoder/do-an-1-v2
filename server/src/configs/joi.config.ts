import Joi from 'joi';

export const mongooseId = Joi.string().hex().length(24).required();
