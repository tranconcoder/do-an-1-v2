import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import { Types } from 'mongoose';

/* ------------------------ Repository ----------------------- */
import {
    createAddress,
    findUserAddresses,
    findAddressById,
    findOneAndUpdateAddress,
    setDefaultAddress,
    deleteAddress,
    findDefaultAddress
} from '@/models/repository/address/index.js';
import { locationModel } from '@/models/location.model.js';

export default new (class AddressService {
    /* ---------------------------------------------------------- */
    /*                      Get User Addresses                   */
    /* ---------------------------------------------------------- */
    async getUserAddresses(userId: string) {
        return await findUserAddresses(userId);
    }

    /* ---------------------------------------------------------- */
    /*                     Get Default Address                   */
    /* ---------------------------------------------------------- */
    async getDefaultAddress(userId: string) {
        return await findDefaultAddress(userId);
    }

    /* ---------------------------------------------------------- */
    /*                       Create Address                      */
    /* ---------------------------------------------------------- */
    async createAddress(userId: string, addressData: {
        recipient_name: string;
        recipient_phone: string;
        location: string;
        address_label?: string;
        is_default?: boolean;
    }) {
        // Validate location exists
        const location = await locationModel.findById(addressData.location);
        if (!location) {
            throw new NotFoundErrorResponse({ message: 'Location not found!' });
        }

        // If this is set as default, unset other defaults first
        if (addressData.is_default) {
            await this.unsetAllDefaults(userId);
        }

        // If this is the first address, make it default
        const existingAddresses = await findUserAddresses(userId);
        const isFirstAddress = existingAddresses.length === 0;

        const newAddress = await createAddress({
            user: new Types.ObjectId(userId),
            recipient_name: addressData.recipient_name,
            recipient_phone: addressData.recipient_phone,
            location: new Types.ObjectId(addressData.location),
            address_label: addressData.address_label,
            is_default: addressData.is_default || isFirstAddress,
            is_active: true
        });

        // Return the created address with populated location
        return await findAddressById({
            id: newAddress._id
        }).populate({
            path: 'location',
            populate: [
                { path: 'province', select: 'province_name province_type' },
                { path: 'district', select: 'district_name district_type' },
                { path: 'ward', select: 'ward_name ward_type' }
            ]
        }).lean();
    }

    /* ---------------------------------------------------------- */
    /*                       Update Address                      */
    /* ---------------------------------------------------------- */
    async updateAddress(userId: string, addressId: string, updateData: {
        recipient_name?: string;
        recipient_phone?: string;
        location?: string;
        address_label?: string;
        is_default?: boolean;
    }) {
        // Check if address exists and belongs to user
        const existingAddress = await findAddressById({
            id: addressId
        }).where({ user: new Types.ObjectId(userId), is_active: true });

        if (!existingAddress) {
            throw new NotFoundErrorResponse({ message: 'Address not found!' });
        }

        // Validate location if provided
        if (updateData.location) {
            const location = await locationModel.findById(updateData.location);
            if (!location) {
                throw new NotFoundErrorResponse({ message: 'Location not found!' });
            }
        }

        // If setting as default, unset other defaults first
        if (updateData.is_default) {
            await this.unsetAllDefaults(userId);
        }

        const updatedAddress = await findOneAndUpdateAddress({
            query: { 
                _id: new Types.ObjectId(addressId), 
                user: new Types.ObjectId(userId),
                is_active: true 
            },
            update: {
                ...(updateData.recipient_name && { recipient_name: updateData.recipient_name }),
                ...(updateData.recipient_phone && { recipient_phone: updateData.recipient_phone }),
                ...(updateData.location && { location: new Types.ObjectId(updateData.location) }),
                ...(updateData.address_label !== undefined && { address_label: updateData.address_label }),
                ...(updateData.is_default !== undefined && { is_default: updateData.is_default })
            },
            options: { new: true }
        }).populate({
            path: 'location',
            populate: [
                { path: 'province', select: 'province_name province_type' },
                { path: 'district', select: 'district_name district_type' },
                { path: 'ward', select: 'ward_name ward_type' }
            ]
        });

        return updatedAddress;
    }

    /* ---------------------------------------------------------- */
    /*                      Set Default Address                  */
    /* ---------------------------------------------------------- */
    async setDefaultAddress(userId: string, addressId: string) {
        const address = await findAddressById({
            id: addressId
        }).where({ user: new Types.ObjectId(userId), is_active: true });

        if (!address) {
            throw new NotFoundErrorResponse({ message: 'Address not found!' });
        }

        return await setDefaultAddress(userId, addressId);
    }

    /* ---------------------------------------------------------- */
    /*                       Delete Address                      */
    /* ---------------------------------------------------------- */
    async deleteAddress(userId: string, addressId: string) {
        const address = await findAddressById({
            id: addressId
        }).where({ user: new Types.ObjectId(userId), is_active: true });

        if (!address) {
            throw new NotFoundErrorResponse({ message: 'Address not found!' });
        }

        // If deleting default address, set another address as default
        if (address.is_default) {
            const otherAddresses = await findUserAddresses(userId);
            const otherActiveAddresses = otherAddresses.filter(
                (addr: any) => addr._id.toString() !== addressId && addr.is_active
            );

            if (otherActiveAddresses.length > 0) {
                await setDefaultAddress(userId, otherActiveAddresses[0]._id.toString());
            }
        }

        return await deleteAddress(userId, addressId);
    }

    /* ---------------------------------------------------------- */
    /*                       Private Methods                     */
    /* ---------------------------------------------------------- */
    private async unsetAllDefaults(userId: string) {
        await findOneAndUpdateAddress({
            query: { user: new Types.ObjectId(userId), is_default: true, is_active: true },
            update: { is_default: false }
        });
    }
})(); 