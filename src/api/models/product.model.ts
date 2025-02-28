import { InferRawDocType, Schema, model } from 'mongoose';
import { required } from '../helpers/mongooseKeyWord.helper';
import { USER_MODEL_NAME } from './user.model';

export const PRODUCT_COLLECTION_NAME = 'Product';
export const PRODUCT_MODEL_NAME = 'products';

const productSchemaDefinition = {
    product_shop: {
        type: Schema.Types.ObjectId,
        required,
        ref: USER_MODEL_NAME
    },
    product_name: { type: String, required },
    product_cost: { type: Number, required },
    product_thumb: { type: String, required },
    product_quantity: { type: Number, required },
    product_description: { type: String, required },
    product_category: { type: String, enum: ['Phone'], required },
    product_rating: { type: Number, required },
    product_attribute: { type: Schema.Types.Mixed, required }
};
const productSchema = new Schema(productSchemaDefinition, {
    collection: PRODUCT_COLLECTION_NAME
});

export type ProductSchema = InferRawDocType<typeof productSchemaDefinition>;
export default model(PRODUCT_COLLECTION_NAME, productSchema);

/* ====================================================== */
/*                          PHONE                         */
/* ====================================================== */
const PHONE_COLLECTION_NAME = 'Phone';
const PHONE_MODEL_NAME = 'phones';

const phoneSchemaDefinition = {
    memory: { type: String, required }
};
const phoneSchema = new Schema(phoneSchemaDefinition, {
    collection: PHONE_COLLECTION_NAME
});

export type PhoneSchema = InferRawDocType<typeof phoneSchemaDefinition>;
export const phoneModel = model(PHONE_MODEL_NAME, phoneSchema);
