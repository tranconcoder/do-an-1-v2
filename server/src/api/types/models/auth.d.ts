import mongoose, { Document } from 'mongoose';
import { joiTypes } from '../joi';

declare global {
    namespace model {
        namespace auth {
            type UserSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    phoneNumber: string;
                    password: string;
                    email: string;

                    avatar: string;
                    fullName: string;
                    dayOfBirth?: Date;

                    role: mongoose.Types.ObjectId;
                    is_active?: boolean;
                },
                isModel,
                isDoc,
                {
                    _id: string;
                }
            >;
        }
    }
}
