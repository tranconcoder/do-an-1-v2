import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { USER_MODEL_NAME } from './user.model.js';
import { required, timestamps } from '@/configs/mongoose.config.js';
export const KEY_TOKEN_MODEL_NAME = 'KeyToken';
export const KEY_TOKEN_COLLECTION_NAME = 'key_tokens';

const keyTokenSchema = new Schema<model.keyToken.KeyTokenSchema>(
    {
        user: { type: ObjectId, required, ref: USER_MODEL_NAME },
        private_key: { type: String, required },
        public_key: { type: String, required },
        refresh_token: { type: String, required },
        refresh_tokens_used: { type: [String], default: [] }
    },
    {
        timestamps,
        collection: KEY_TOKEN_COLLECTION_NAME,
    }
);

export default model(KEY_TOKEN_MODEL_NAME, keyTokenSchema);
