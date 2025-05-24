import { Router } from "express";
import otpController from "@/controllers/otp.controller.js";
import catchError from "@/middlewares/catchError.middleware.js";
import validateRequestBody from "@/middlewares/joiValidate.middleware.js";
import { sendOTP, verifyOTP } from "@/validations/zod/otp.joi.js";

const router = Router();

router.post('/send', validateRequestBody(sendOTP), catchError(otpController.sendOTP));

router.post('/verify', validateRequestBody(verifyOTP), catchError(otpController.verifyOTP));

export default router;