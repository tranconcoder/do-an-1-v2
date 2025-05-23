import Joi from "joi";

export const sendOTP = Joi.object({
    email: Joi.string().email().required(),
});

export const verifyOTP = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
});