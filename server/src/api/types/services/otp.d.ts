import type { ObjectId } from "mongoose";

declare global {
    namespace service {
        namespace otp {
            /* ---------------------------------------------------------- */
            /*                          Arguments                         */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface SendOTP extends Pick<model.otp.OTPSchema, 'email'> {
                }

                interface VerifyOTP extends Pick<model.otp.OTPSchema, 'otp'> {
                    user: model.user.UserSchema;
                }
            }
        }
    }
}