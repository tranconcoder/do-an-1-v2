import Joi from 'joi';

export const mongooseId = Joi.string().hex().length(24).required();

export const discountCode = Joi.string().min(6).max(10).required();

export const passwordType = Joi.string()
    .required()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);

export const phoneNumber = Joi.string()
    .required()
    .regex(/(\+84|84|0[3|5|7|8|9])+([0-9]{8})\b/);

export const pagination = Joi.object({
    page: Joi.number(),
    limit: Joi.number()
});

export const paramsId = (fieldName: string, required: boolean = true) => {
    return Joi.object({
        [fieldName]: required ? mongooseId.required() : mongooseId.optional()
    });
};
