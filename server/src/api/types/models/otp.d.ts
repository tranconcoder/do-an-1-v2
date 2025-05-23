import type { ObjectId } from "mongoose";

declare global {
    namespace model {
        namespace otp {
            interface CommonTypes {
                _id: string;
            }

            type OTPSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    email: string;
                    otp: string;
                    created_at: Date;
                },
                isModel,
                isDoc,
                CommonTypes
            >
        }
    }
}