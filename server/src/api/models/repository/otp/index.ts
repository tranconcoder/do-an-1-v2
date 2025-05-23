import otpModel from '@/models/otp.model.js';
import { generateFindAll, generateFindAllPaganation, generateFindOne } from '@/utils/mongoose.util.js';

/* ---------------------------------------------------------- */
/*                           Find                             */
/* ---------------------------------------------------------- */
export const findAllOTP = generateFindAll<model.otp.OTPSchema>(otpModel);

export const findAllOTPPaganation = generateFindAllPaganation<model.otp.OTPSchema>(otpModel);

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
export const findOneOTP = generateFindOne<model.otp.OTPSchema>(otpModel)

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */

