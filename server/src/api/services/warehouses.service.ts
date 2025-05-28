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

export default new (class WarehousesService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async createWarehouses(payload: service.warehouses.arguments.CreateWarehouse) {
        const { name, phoneNumber } = payload;

        const location = await locationService.createLocation(payload.location);
        if (!location) throw new BadRequestErrorResponse({ message: 'Create location failed!' });

        /* --------------------- Get coordinates -------------------- */
        let locationText = await locationService.getLocationTextById(location.id);
        if (!locationText)
            throw new BadRequestErrorResponse({ message: 'Get location text failed!' });
        locationText = locationText.split(', ').slice(1).join(', ');

        console.log('Location text:', locationText);

        let response = await Geocode.geocode({
            text: locationText,
            boundary_country: ['VN']
        });

        const coordinates = response?.features?.at(0)?.geometry?.coordinates;
        if (!coordinates) throw new BadRequestErrorResponse({ message: 'Get coordinates failed!' });

        /* --------------------- Update location -------------------- */
        const updatedLocation = await locationService.updateCoordinatesById(location.id, {
            x: coordinates[0],
            y: coordinates[1]
        });
        if (!updatedLocation)
            throw new BadRequestErrorResponse({ message: 'Update location coordinates failed!' });

        const warehouses = await warehouseModel.create({
            address: location.id,
            name,
            phoneNumber,
            shop: payload.shop
        });

        return warehouses;
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
            const currentLocation =
                currentWarehouses.address as any as model.location.LocationSchema<false, true>;

            if (!currentLocation)
                throw new BadRequestErrorResponse({ message: 'Old location not found!' });

            currentLocation.province = location.provinceId;
            currentLocation.district = location.districtId;
            currentLocation.ward = location.wardId;
            currentLocation.address = location.address;

            const updateLocation = currentLocation.save();
            if (!updateLocation)
                throw new BadRequestErrorResponse({ message: 'Update location failed!' });
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
