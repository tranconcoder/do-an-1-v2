import inventoryModel from '@/models/inventory.model.js';
import {
    findByIdAndUpdateInventory,
    findOneAndUpdateInventory
} from '@/models/repository/inventory/index.js';
import { findLocation, findLocationById } from '@/models/repository/location/index.js';
import { findSKUById } from '@/models/repository/sku/index.js';
import { findWarehouseById } from '@/models/repository/warehouses/index.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import { jwtPayloadSignSchema } from '@/validations/joi/jwt.joi.js';

export default new (class InventoryService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async createInventory({
        notCheck = false,
        ...payload
    }: service.inventory.arguments.CreateInventory) {
        const { inventory_sku, inventory_warehouses } = payload;

        if (!notCheck) {
            /* ----------------- Handle check arguments ----------------- */
            const sku = await findSKUById({ id: inventory_sku, options: { lean: true } });
            if (!sku) throw new NotFoundErrorResponse({ message: 'Not found SKU!' });

            const warehouses = await findWarehouseById({
                id: inventory_warehouses,
                options: { lean: true }
            });
            if (!warehouses) throw new NotFoundErrorResponse({ message: 'Not found location!' });
        }

        return inventoryModel.create(payload);
    }

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    async deleteInventory(id: string) {
        return await findByIdAndUpdateInventory({
            id,
            update: { is_deleted: true, deleted_at: new Date() },
            options: { lean: true, new: true }
        });
    }
})();
