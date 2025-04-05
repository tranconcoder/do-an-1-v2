import {
    generateFindByIdAndUpdate,
    generateFindOne,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';
import inventoryModel from '@/models/inventory.model.js';

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createInventory = async (payload: service.inventory.arguments.CreateInventory) => {
    return await inventoryModel.create(payload);
};

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
export const findOneInventory = generateFindOne<model.inventory.InventorySchema>(inventoryModel);

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */

/* ------------------ Find by id and update ----------------- */
export const findByIdAndUpdateInventory =
    generateFindByIdAndUpdate<model.inventory.InventorySchema>(inventoryModel);

/* ------------------ Find one and update  ------------------ */
export const findOneAndUpdateInventory =
    generateFindOneAndUpdate<model.inventory.InventorySchema>(inventoryModel);

/* --------------------- Order product  --------------------- */
export const orderProductInventory = (productId: string, orderQuantity: number) => {
    return findOneAndUpdateInventory({
        query: {
            inventory_product: productId,
            inventory_stock: { $gte: orderQuantity }
        },
        update: {
            $inc: {
                inventory_stock: -orderQuantity
            }
        },
        options: {
            new: true
        }
    });
};

/* --------------------- Revert product --------------------- */
export const revertProductInventory = async (productId: string, orderQuantity: number) => {
    return await findOneAndUpdateInventory({
        query: {
            inventory_product: productId
        },
        update: {
            inventory_stock: { $inc: orderQuantity }
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

export const increaseInventoryStock = async (productId: string, incStock: number) => {
    return await findByIdAndUpdateInventory({
        id: productId,
        update: {
            $inc: { inventory_stock: incStock }
        },
        options: { new: true }
    });
};

export const decreaseInventoryStock = async (productId: string, decStock: number) => {
    return await findByIdAndUpdateInventory({
        id: productId,
        update: {
            $inc: { inventory_stock: -decStock }
        },
        options: { new: true }
    });
};
