import {
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate,
    generateFindAll
} from '@/utils/mongoose.util.js';
import { addressModel } from '@/models/address.model.js';
import { Types } from 'mongoose';

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */

export const findAddressById = generateFindById<model.address.AddressSchema>(addressModel);

export const findOneAddress = generateFindOne<model.address.AddressSchema>(addressModel);

export const findAddresses = generateFindAll<model.address.AddressSchema>(addressModel);

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */

export const createAddress = async (data: any) => {
    return await addressModel.create(data);
};

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */

export const findOneAndUpdateAddress = generateFindOneAndUpdate<model.address.AddressSchema>(addressModel);

/* ---------------------------------------------------------- */
/*                      Custom Functions                      */
/* ---------------------------------------------------------- */

// Get all active addresses for a user
export const findUserAddresses = async (userId: string) => {
    return await addressModel.find({ 
        user: new Types.ObjectId(userId), 
        is_active: true 
    })
    .populate({
        path: 'location',
        populate: [
            { path: 'province', select: 'province_name province_type' },
            { path: 'district', select: 'district_name district_type' },
            { path: 'ward', select: 'ward_name ward_type' }
        ]
    })
    .sort({ is_default: -1, createdAt: -1 })
    .lean();
};

// Get default address for a user
export const findDefaultAddress = async (userId: string) => {
    return await addressModel.findOne({ 
        user: new Types.ObjectId(userId), 
        is_default: true, 
        is_active: true 
    })
    .populate({
        path: 'location',
        populate: [
            { path: 'province', select: 'province_name province_type' },
            { path: 'district', select: 'district_name district_type' },
            { path: 'ward', select: 'ward_name ward_type' }
        ]
    })
    .lean();
};

// Set address as default (and unset others)
export const setDefaultAddress = async (userId: string, addressId: string) => {
    // First, unset all default addresses for the user
    await addressModel.updateMany(
        { user: new Types.ObjectId(userId), is_active: true },
        { is_default: false }
    );

    // Then set the specified address as default
    return await findOneAndUpdateAddress({
        query: { 
            _id: new Types.ObjectId(addressId), 
            user: new Types.ObjectId(userId),
            is_active: true 
        },
        update: { is_default: true },
        options: { new: true }
    });
};

// Soft delete address
export const deleteAddress = async (userId: string, addressId: string) => {
    return await findOneAndUpdateAddress({
        query: { 
            _id: new Types.ObjectId(addressId), 
            user: new Types.ObjectId(userId) 
        },
        update: { is_active: false, is_default: false },
        options: { new: true }
    });
}; 