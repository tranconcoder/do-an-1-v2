import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { required, timestamps } from '@/configs/mongoose.config.js';
import { USER_MODEL_NAME } from './user.model.js';
import { LOCATION_MODEL_NAME } from './location.model.js';

export const ADDRESS_MODEL_NAME = 'Address';
export const ADDRESS_COLLECTION_NAME = 'addresses';

const addressSchema = new Schema<model.address.AddressSchema>(
    {
        user: { type: ObjectId, ref: USER_MODEL_NAME, required },
        
        recipient_name: { type: String, required, maxLength: 100 },
        recipient_phone: { type: String, required, length: 10 },
        
        location: { type: ObjectId, ref: LOCATION_MODEL_NAME, required },
        
        address_label: { type: String, maxLength: 50 }, // e.g., "Home", "Office", "Other"
        
        is_default: { type: Boolean, default: false },
        
        is_active: { type: Boolean, default: true }
    },
    {
        collection: ADDRESS_COLLECTION_NAME,
        timestamps
    }
);

// Ensure only one default address per user
addressSchema.index({ user: 1, is_default: 1 }, { 
    unique: true, 
    partialFilterExpression: { is_default: true, is_active: true } 
});

// Index for efficient queries
addressSchema.index({ user: 1, is_active: 1 });

export const addressModel = model(ADDRESS_MODEL_NAME, addressSchema); 