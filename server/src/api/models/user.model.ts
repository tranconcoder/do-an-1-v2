import { InferRawDocType, Schema, model } from 'mongoose';
import { ROLE_MODEL_NAME } from './role.model';
import { required, unique, timestamps } from '../../configs/mongoose.config';

export const USER_MODEL_NAME = 'User';
export const USER_COLLECTION_NAME = 'users';

const userSchema = new Schema<modelTypes.auth.UserSchema>(
    {
        phoneNumber: { type: String, length: 10, required, unique },
        email: { type: String, unique },
        password: { type: String, required },
        fullName: { type: String, required },
        role: { type: Schema.Types.ObjectId, required, ref: ROLE_MODEL_NAME },
        dayOfBirth: Date
    },
    {
        collection: USER_COLLECTION_NAME,
        timestamps
    }
);

export const userModel = model(USER_MODEL_NAME, userSchema);
