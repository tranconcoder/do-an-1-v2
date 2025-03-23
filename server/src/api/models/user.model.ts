import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { ROLE_MODEL_NAME } from './role.model.js';
import { required, unique, timestamps } from '@/configs/mongoose.config.js';

export const USER_MODEL_NAME = 'User';
export const USER_COLLECTION_NAME = 'users';

const userSchema = new Schema<model.auth.UserSchema>(
    {
        /* ---------------------- Authenticate ---------------------- */
        phoneNumber: { type: String, length: 10, required, unique },
        email: { type: String, unique },
        password: { type: String, required },

        /* ---------------------- Information  ---------------------- */
        avatar: { type: String, default: '' },
        fullName: { type: String, required },
        dayOfBirth: Date,

        role: { type: ObjectId, required, ref: ROLE_MODEL_NAME },

        is_active: { type: Boolean, default: true }
    },
    {
        collection: USER_COLLECTION_NAME,
        timestamps
    }
);

export const userModel = model(USER_MODEL_NAME, userSchema);
