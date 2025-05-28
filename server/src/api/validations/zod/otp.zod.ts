import { generateValidateWithBody } from '@/middlewares/zod.middleware';
import z from 'zod';

export const sendOTP = z.object({
    email: z.string().email()
});
export type SendOTPSchema = z.infer<typeof sendOTP>;
export const validateSendOTP = generateValidateWithBody(sendOTP);

export const verityOTP = z.object({
    email: z.string().email(),
    otp: z.string().length(6)
});
export type VerifyOTPSchema = z.infer<typeof verityOTP>;
export const validateVerifyOTP = generateValidateWithBody(verityOTP);
