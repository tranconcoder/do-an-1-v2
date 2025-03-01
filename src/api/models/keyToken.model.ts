import { InferRawDocType, Schema, model } from 'mongoose';
import { USER_MODEL_NAME } from './user.model';
import { required, timestamps } from '../../configs/mongoose.config';

export const KEY_TOKEN_MODEL_NAME = 'KeyToken';
export const KEY_TOKEN_COLLECTION_NAME = 'key_tokens';

const keyTokenSchemaDefinition = {
    user: { type: Schema.Types.ObjectId, require, ref: USER_MODEL_NAME },
    private_key: { type: String, required },
    public_key: { type: String, required },
    refresh_token: { type: String, required },
    refresh_tokens_used: { type: [String], default: [] }
};

const keyTokenSchema = new Schema(keyTokenSchemaDefinition, {
    timestamps,
    collection: KEY_TOKEN_COLLECTION_NAME
});

export type KeyTokenModel = InferRawDocType<typeof keyTokenSchemaDefinition>;

export default model(KEY_TOKEN_MODEL_NAME, keyTokenSchema);
