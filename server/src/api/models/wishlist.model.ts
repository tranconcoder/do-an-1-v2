import { ObjectId, required, unique} from '@/configs/mongoose.config.js';
import { Schema, model } from 'mongoose';
import { USER_MODEL_NAME } from './user.model.js';
import { SKU_MODEL_NAME } from './sku.model.js';

export const WISHLIST_MODEL_NAME = 'Wishlist';
export const WISHLIST_COLLECTION_NAME = 'wishlists';

const wishlistSchema = new Schema({
  user: { type: ObjectId, ref: USER_MODEL_NAME, required},
  products: [{ type: ObjectId, ref: SKU_MODEL_NAME, required, unique}],
});

export default model(WISHLIST_MODEL_NAME, wishlistSchema, WISHLIST_COLLECTION_NAME);