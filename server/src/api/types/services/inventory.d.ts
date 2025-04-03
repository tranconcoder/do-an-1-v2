declare namespace service {
    namespace inventory {
        /* ---------------------------------------------------------- */
        /*                         Arguments                          */
        /* ---------------------------------------------------------- */
        namespace arguments {
            interface CreateInventory
                extends Omit<model.inventory.InventorySchema, '_id' | 'inventory_reservations'>,
                    commonTypes.object.OptimizeOptions {}
        }
    }
}
