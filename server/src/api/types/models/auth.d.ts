import type mongoose, { Document } from 'mongoose';
import { joiTypes } from '../joi';
import type { UserStatus } from '@/enums/user.enum.ts';

declare global {
    namespace model {
        namespace auth {
            type UserSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    phoneNumber: string;
                    password: string;

                    user_email: string;
                    user_avatar: string;
                    user_fullName: string;
                    user_dayOfBirth?: Date;
                    user_sex: boolean;

                    user_role: mongoose.Types.ObjectId;
                    user_status?: UserStatus;
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
