import warehouseModel from '@/models/warehouse.model.js';
import locationService from './location.service.js';
import { BadRequestErrorResponse } from '@/response/error.response.js';
import {
    findWarehouses,
    findWarehouseById,
    findOneAndDelete,
    findOneAndUpdateWarehouse
} from '@/models/repository/warehouses/index.js';
import { get$SetNestedFromObject } from '@/utils/mongoose.util.js';
import { Geocode } from './openrouteservice.service.js';
import { CreateWarehouseSchema, UpdateWarehouseSchema } from '@/validations/zod/warehouse.zod.js';

export default new (class WarehousesService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async createWarehouses(payload: service.warehouses.arguments.CreateWarehouse) {
        const { name, phoneNumber } = payload;

        const location = await locationService.createLocation(payload.location);
        if (!location) throw new BadRequestErrorResponse({ message: 'Create location failed!' });

        const warehouses = await warehouseModel.create({
            address: location.id,
            name,
            phoneNumber,
            shop: payload.shop
        });

        return warehouses;
    }

    /* -------------------- Create with Zod types ------------------- */
    async createWarehouseWithZod(payload: CreateWarehouseSchema & { shop: string }) {
        const { name, phoneNumber, location, shop } = payload;

        const locationDoc = await locationService.createLocation({
            provinceId: location.provinceId,
            districtId: location.districtId,
            wardId: location.wardId,
            address: location.address
        });
        if (!locationDoc) throw new BadRequestErrorResponse({ message: 'Create location failed!' });

        const warehouse = await warehouseModel.create({
            address: locationDoc.id,
            name,
            phoneNumber,
            shop
        });

        return warehouse;
    }

    /* ---------------------------------------------------------- */
    /*                             Get                            */
    /* ---------------------------------------------------------- */
    async getAllWarehouses(shopId: string) {
        return await findWarehouses({
            query: { shop: shopId },
            options: { lean: true, populate: ['address'] }
        });
    }

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */
    async updateWarehouses(payload: service.warehouses.arguments.UpdateWarehouses) {
        const { id } = payload;
        const { location, ...warehouseInfo } = payload.update;

        const currentWarehouses = await findWarehouseById({
            id,
            options: { populate: 'address' }
        });
        if (!currentWarehouses)
            throw new BadRequestErrorResponse({ message: 'Warehouses not found!' });

        /* ----------------- Handle update location ----------------- */
        if (location) {
            // Store old location ID for deletion
            const oldLocationId = (currentWarehouses.address as any)?._id || currentWarehouses.address;

            // Create new location instead of updating existing one
            const newLocation = await locationService.createLocation(location);
            if (!newLocation) {
                throw new BadRequestErrorResponse({ message: 'Create new location failed!' });
            }

            // Update warehouse to point to new location
            await findOneAndUpdateWarehouse({
                query: { _id: id },
                update: { $set: { address: newLocation._id } },
                options: { new: true }
            });

            // Delete old location (non-blocking operation)
            if (oldLocationId && oldLocationId.toString() !== newLocation._id.toString()) {
                locationService.deleteLocation(oldLocationId.toString())
                    .then((deleted) => {
                        console.log(deleted ? '🗑️ Old location deleted' : '⚠️ Failed to delete old location', oldLocationId);
                    })
                    .catch((error) => {
                        console.error('❌ Error deleting old location:', oldLocationId, error);
                    });
            }
        }

        /* ----------------- Handle update warehouses -------------- */
        const $set: commonTypes.object.ObjectAnyKeys = {};
        get$SetNestedFromObject(warehouseInfo, $set);

        return await findOneAndUpdateWarehouse({
            query: { _id: id },
            update: { $set },
            options: { lean: true, new: true, populate: ['address'] }
        });
    }

    /* -------------------- Update with Zod types ------------------- */
    async updateWarehouseWithZod(warehouseId: string, updateData: UpdateWarehouseSchema) {
        console.log('🏭 [WAREHOUSE SERVICE] Update request:', {
            warehouseId,
            updateData,
            hasLocation: !!updateData.location,
            locationData: updateData.location
        });

        const { location, ...warehouseInfo } = updateData;

        const currentWarehouse = await findWarehouseById({
            id: warehouseId,
            options: { populate: 'address' }
        });
        if (!currentWarehouse)
            throw new BadRequestErrorResponse({ message: 'Warehouse not found!' });

        console.log('📦 [WAREHOUSE SERVICE] Current warehouse data:', {
            warehouseId: currentWarehouse._id,
            currentAddress: currentWarehouse.address,
            addressType: typeof currentWarehouse.address,
            addressId: (currentWarehouse.address as any)?._id
        });

        /* ----------------- Handle update location ----------------- */
        if (location && location.provinceId && location.districtId && location.address) {
            console.log('🗺️ [WAREHOUSE SERVICE] Creating new location:', location);

            // Store old location ID for deletion
            const oldLocationId = (currentWarehouse.address as any)?._id || currentWarehouse.address;
            console.log('🗂️ [WAREHOUSE SERVICE] Old location ID to delete:', oldLocationId);

            // Create new location instead of updating existing one
            const newLocation = await locationService.createLocation({
                provinceId: location.provinceId,
                districtId: location.districtId,
                wardId: location.wardId,
                address: location.address
            });

            if (!newLocation) {
                throw new BadRequestErrorResponse({ message: 'Create new location failed!' });
            }

            console.log('✅ [WAREHOUSE SERVICE] New location created:', {
                locationId: newLocation._id,
                locationData: newLocation
            });

            // Update warehouse to point to new location
            const updatePayload = {
                address: newLocation._id,
                ...Object.keys(warehouseInfo).length > 0 ? (() => {
                    const $set: commonTypes.object.ObjectAnyKeys = {};
                    get$SetNestedFromObject(warehouseInfo, $set);
                    return $set;
                })() : {}
            };

            console.log('🔄 [WAREHOUSE SERVICE] Updating warehouse with payload:', updatePayload);

            const updatedWarehouse = await findOneAndUpdateWarehouse({
                query: { _id: warehouseId },
                update: { $set: updatePayload },
                options: { lean: true, new: true, populate: ['address'] }
            });

            if (!updatedWarehouse) {
                throw new BadRequestErrorResponse({ message: 'Update warehouse failed!' });
            }

            console.log('✅ [WAREHOUSE SERVICE] Warehouse updated successfully:', {
                warehouseId: updatedWarehouse._id,
                newAddressId: updatedWarehouse.address
            });

            // Delete old location (non-blocking operation)
            if (oldLocationId && oldLocationId.toString() !== newLocation._id.toString()) {
                locationService.deleteLocation(oldLocationId.toString())
                    .then((deleted) => {
                        if (deleted) {
                            console.log('🗑️ [WAREHOUSE SERVICE] Old location deleted successfully:', oldLocationId);
                        } else {
                            console.warn('⚠️ [WAREHOUSE SERVICE] Failed to delete old location:', oldLocationId);
                        }
                    })
                    .catch((error) => {
                        console.error('❌ [WAREHOUSE SERVICE] Error deleting old location:', oldLocationId, error);
                    });
            }

            return updatedWarehouse;
        }

        /* ----------------- Handle update warehouse info only -------------- */
        if (Object.keys(warehouseInfo).length > 0) {
            const $set: commonTypes.object.ObjectAnyKeys = {};
            get$SetNestedFromObject(warehouseInfo, $set);

            const updatedWarehouse = await findOneAndUpdateWarehouse({
                query: { _id: warehouseId },
                update: { $set },
                options: { lean: true, new: true, populate: ['address'] }
            });

            if (!updatedWarehouse) {
                throw new BadRequestErrorResponse({ message: 'Update warehouse failed!' });
            }

            return updatedWarehouse;
        }

        // If no updates provided, return current warehouse
        return await findWarehouseById({
            id: warehouseId,
            options: { lean: true, populate: ['address'] }
        });
    }

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    async deleteWarehouses(payload: service.warehouses.arguments.DeleteWarehouses) {
        const { id: _id, shopId: shop } = payload;

        const warehouse = await findOneAndDelete({
            query: { _id, shop }
        });

        if (!warehouse) throw new BadRequestErrorResponse({ message: 'Warehouses not found!' });

        return warehouse;
    }
})();
