import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { ROLE_MODEL_NAME } from './role.model.js';
import { required, unique, timestamps } from '@/configs/mongoose.config.js';

export const USER_MODEL_NAME = 'User';
export const USER_COLLECTION_NAME = 'users';

const userSchema = new Schema<modelTypes.auth.UserSchema>(
    {
        phoneNumber: { type: String, length: 10, required, unique },
        email: { type: String, unique },
        password: { type: String, required },
        fullName: { type: String, required },
        role: { type: ObjectId, required, ref: ROLE_MODEL_NAME },
        dayOfBirth: Date
    },
    {
        collection: USER_COLLECTION_NAME,
        timestamps
    }
);

export const userModel = model(USER_MODEL_NAME, userSchema);
