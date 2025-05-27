import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { ROLE_MODEL_NAME } from './role.model.js';
import { required, unique, timestamps } from '@/configs/mongoose.config.js';
import { UserStatus } from '@/enums/user.enum.js';

export const USER_MODEL_NAME = 'User';
export const USER_COLLECTION_NAME = 'users';

const userSchema = new Schema<model.auth.UserSchema>(
    {
        /* ---------------------- Authenticate ---------------------- */
        phoneNumber: { type: String, length: 10, required, unique },
        password: { type: String, required, select: false },

        /* ---------------------- Information  ---------------------- */
        user_email: { type: String, unique },
        user_avatar: { type: String, default: undefined },
        user_fullName: { type: String, required },
        user_dayOfBirth: Date,
        user_sex: { type: Boolean, default: false }, // true => male, false => female

        /* ------------------------ Metadata ------------------------ */
        user_role: { type: ObjectId, required, ref: ROLE_MODEL_NAME },
        user_status: { type: String, enum: UserStatus, default: UserStatus.ACTIVE }
    },
    {
        collection: USER_COLLECTION_NAME,
        timestamps
    }
);

export const userModel = model(USER_MODEL_NAME, userSchema);
