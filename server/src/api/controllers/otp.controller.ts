import { findOneUser, findUserById } from "@/models/repository/user/index.js";
import { NotFoundErrorResponse } from "@/response/error.response.js";
import { OkResponse } from "@/response/success.response.js";
import otpService from "@/services/otp.service.js";
import { RequestWithBody } from "@/types/request.js";
import { RequestHandler } from "express"

export default new class OTPController {
    /* ------------------------------------------------------ */
    /*                        Send OTP                        */
    /* ------------------------------------------------------ */
    sendOTP: RequestWithBody<service.otp.arguments.SendOTP> = async (req, res) => {
        const user = await findOneUser({
            query: {user_email: req.body.email},
            options: { lean: true }
        });
        if (!user) throw new NotFoundErrorResponse({ message: "User not found" });

        await otpService.sendOTP({ email: user.user_email });

        new OkResponse({
            message: "OTP sent successfully",
        }).send(res);
    }

    /* ------------------------------------------------------ */
    /*                        Verify OTP                       */
    /* ------------------------------------------------------ */
    verifyOTP: RequestHandler = async (req, res) => {
        const { email, otp } = req.body;

        const user = await findOneUser({
            query: {user_email: email},
            options: { lean: true }
        });
        if (!user) throw new NotFoundErrorResponse({ message: "User not found" });

        new OkResponse({
            message: "OTP verified successfully",
            metadata: await otpService.verifyOTP({ user, otp })
        }).send(res);
    }
}