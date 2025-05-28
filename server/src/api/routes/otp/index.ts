import { Router } from 'express';
import otpController from '@/controllers/otp.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateSendOTP, validateVerifyOTP } from '@/validations/zod/otp.zod';

const router = Router();

router.post('/send', validateSendOTP, catchError(otpController.sendOTP));

router.post('/verify', validateVerifyOTP, catchError(otpController.verifyOTP));

export default router;
