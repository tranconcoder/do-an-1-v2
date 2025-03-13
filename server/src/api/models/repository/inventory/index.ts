import inventoryModel from '../../inventory.model';

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createInventory = async (
    payload: serviceTypes.inventory.arguments.CreateInventory
) => {
    return await inventoryModel.create(payload);
};

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */

/* ----------------- Update inventory stock ----------------- */
export const updateInventoryStock = async (
    productId: string,
    newStock: number
) => {
    return (
        (
            await inventoryModel.updateOne(
                { inventory_product: productId },
                { inventory_stock: newStock }
            )
        ).modifiedCount > 0
    );
};
