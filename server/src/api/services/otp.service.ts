/* -------------------------- Libs -------------------------- */
import nodemailer from 'nodemailer';
import _ from 'lodash';

/* ------------------------ Response ------------------------ */
import { BadRequestErrorResponse, ForbiddenErrorResponse } from '@/response/error.response.js';

/* ------------------------- Config ------------------------- */
import { USER_PUBLIC_FIELDS } from '@/configs/user.config.js';
import { OTP_REFRESH_TOKEN, OTP_CLIENT_SECRET, OTP_CLIENT_ID, OTP_RETRY_TIME, OTP_ACCESS_TOKEN, OTP_EMAIL} from '@/configs/otp.config.js';

/* -------------------------- Model ------------------------- */
import otpModel from '@/models/otp.model.js';

/* ----------------------- Repository ----------------------- */
import { findOneOTP } from '@/models/repository/otp/index.js';

/* -------------------------- Service ----------------------- */
import JwtService from './jwt.service.js';
import KeyTokenService from './keyToken.service.js';

/* -------------------------- Utils ------------------------- */
import { generateOTP, generateOTPHTML } from '@/utils/otp.util.js';


export default new (class OTPService {
    static mailTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: OTP_EMAIL,
            clientId: OTP_CLIENT_ID,
            clientSecret: OTP_CLIENT_SECRET,
            refreshToken: OTP_REFRESH_TOKEN,
            accessToken: OTP_ACCESS_TOKEN
        },
    });

    /* ------------------------------------------------------ */
    /*                        Send OTP                        */
    /* ------------------------------------------------------ */
    async sendOTP({ email }: service.otp.arguments.SendOTP) {
        // Check otp is exists
        const otp = await findOneOTP({ query: { email } });

        if (otp) {
            const allowResendOTP = new Date().getTime() > new Date(otp.created_at).getTime() + OTP_RETRY_TIME;

            if (!allowResendOTP) throw new BadRequestErrorResponse({ message: 'Gửi OTP quá nhiều, vui lòng chờ giây lát và thử lại!' });

            await otpModel.deleteOne({ email });
        }

        // Generate OTP
        const newOtp = generateOTP();

        // Send OTP with nodemailer
        await OTPService.mailTransport.sendMail({
            from: "tranvanconkg@gmail.com",
            to: email,
            subject: "Aliconcon - Mã OTP khôi phục mật khẩu",
            html: generateOTPHTML(newOtp),
        });

        // Save OTP
        await otpModel.findOneAndReplace(
            { email },
            { email, otp: newOtp, created_at: new Date() },
            { upsert: true }
        );

        return true;
    }

    /* ------------------------------------------------------ */
    /*                        Verify OTP                       */
    /* ------------------------------------------------------ */
    async verifyOTP({ user, otp: otpCode }: service.otp.arguments.VerifyOTP) {
        const otp = await findOneOTP({ query: { email: user.user_email, otp: otpCode } });
        if (!otp) throw new BadRequestErrorResponse({ message: 'OTP is not valid' });

        /* --------- Generate token and send response --------- */
        const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
        const jwtPair = await JwtService.signJwtPair({
            privateKey,
            payload: {
                id: user._id.toString(),
                role: user.user_role.toString()
            }
        });
        if (!jwtPair) throw new ForbiddenErrorResponse({ message: 'Generate jwt token failed!' });

        /* ---------------- Save new key token ---------------- */
        const keyTokenId = await KeyTokenService.findOneAndReplace({
            userId: user._id.toString(),
            privateKey,
            publicKey,
            refreshToken: jwtPair.refreshToken
        });
        if (!keyTokenId) throw new ForbiddenErrorResponse({ message: 'Save key token failed!' });

        const authInfo: commonTypes.object.ObjectAnyKeys = {
            token: jwtPair,
            user: _.pick(user, USER_PUBLIC_FIELDS)
        };

        /* ----------------------- Delete OTP ----------------------- */
        await otpModel.deleteOne({ email: user.user_email, otp: otpCode });

        return authInfo;
    }
})();