import mongoose, { Document } from 'mongoose';
import { joiTypes } from '../joi';

declare global {
    namespace modelTypes {
        namespace auth {
            type UserSchema<
                isModel = false,
                isDoc = false
            > = moduleTypes.mongoose.MongooseType<
                {
                    phoneNumber: string;
                    password: string;
                    email: string;
                    fullName: string;
                    role: mongoose.Types.ObjectId;
                    dayOfBirth?: Date;
                },
                isModel,
                isDoc
            >;
        }
    }
}

