import warehouseModel from '@/models/warehouse.model.js';
import locationService from './location.service.js';
import { BadRequestErrorResponse } from '@/response/error.response.js';
import { findLocationById } from '@/models/repository/location/index.js';
import { findWarehouseById } from '@/models/repository/warehouses/index.js';

export default new (class WarehousesService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async createWarehouses(payload: service.warehouses.arguments.CreateWarehouse) {
        const { name, phoneNumber } = payload;
        /* --------------------- Handle save sku -------------------- */
        const location = await locationService.createLocation(payload.location);
        if (!location) throw new BadRequestErrorResponse({ message: 'Create location failed!' });

        const warehouses = await warehouseModel.create({
            address: location.id,
            name,
            phoneNumber
        });

        return warehouses;
    }

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */
    async updateWarehouses(payload: service.warehouses.arguments.UpdateWarehouses) {
        const { id, location } = payload;

        const currentWarehouses = await findWarehouseById({
            id,
            options: { lean: true, projection: { address: 1 } }
        });
        if (!currentWarehouses)
            throw new BadRequestErrorResponse({ message: 'Warehouses not found!' });

        /* ----------------- Handle update location ----------------- */

        if (location) {
            const currentLocation =
                currentWarehouses.address as any as model.location.LocationSchema<false, true>;

            if (!currentLocation)
                throw new BadRequestErrorResponse({ message: 'Old location not found!' });

            currentLocation.province = location.provinceId;
            currentLocation.district = location.districtId;
            currentLocation.ward = location.wardId;
            currentLocation.address = location.address;
        }
    }
})();
