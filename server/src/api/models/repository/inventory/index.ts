import { generateFindOne, generateFindOneAndUpdate } from 'src/api/utils/mongoose.util.js';
import inventoryModel from '../../inventory.model.js';

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createInventory = async (
    payload: serviceTypes.inventory.arguments.CreateInventory
) => {
    return await inventoryModel.create(payload);
};

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
export const findOneInventory =
    generateFindOne<modelTypes.inventory.InventorySchema>(inventoryModel);

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */

/* ------------------ Find one and update  ------------------ */
export const findOneAndUpdateInventory =
    generateFindOneAndUpdate<modelTypes.inventory.InventorySchema>(inventoryModel);

/* --------------------- Order product  --------------------- */
export const orderProductInventory = async (productId: string, orderQuantity: number) => {
    return await findOneAndUpdateInventory({
        query: {
            inventory_product: productId,
            inventory_stock: { $gte: orderQuantity }
        },
        update: {
            inventory_stock: { $inc: -orderQuantity }
        }
    });
};

/* ----------------- Update inventory stock ----------------- */
export const updateInventoryStock = async (productId: string, newStock: number) => {
    return (
        (
            await inventoryModel.updateOne(
                { inventory_product: productId },
                { inventory_stock: newStock }
            )
        ).modifiedCount > 0
    );
};
