import { Schema, model } from 'mongoose';
import { USER_MODEL_NAME } from './user.model.js';
import { required, timestamps, unique } from '@/configs/mongoose.config.js';
import { OTP_EXPIRATION_TIME } from '@/configs/otp.config.js';

export const OTP_MODEL_NAME = 'OTP';
export const OTP_COLLECTION_NAME = 'otps';

export const otpSchema = new Schema({
    email: { type: String, required, unique},
    otp: { type: String, required, length: 6 },
    created_at: { type: Date, default: Date.now },
}, {
    collection: OTP_COLLECTION_NAME,
    timestamps,
});

otpSchema.index({ created_at: 1 }, { expireAfterSeconds: OTP_EXPIRATION_TIME });

export default model(OTP_MODEL_NAME, otpSchema);