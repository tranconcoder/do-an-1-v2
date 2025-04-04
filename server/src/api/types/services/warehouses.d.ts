import '';

declare global {
    namespace service {
        namespace warehouses {
            namespace arguments {
                /* ------------------------- Create ------------------------- */
                interface CreateWarehouse
                    extends Omit<model.warehouse.WarehouseSchema, '_id' | 'address'> {
                    location: service.location.CreateLocation;
                }

                /* ------------------------- Update ------------------------- */
                interface UpdateWarehouses extends Partial<CreateWarehouse> {
                    id: string;
                }

                /* ------------------------- Delete ------------------------- */
                interface DeleteWarehouses {
                    id: string;
                    shopId: string;
                }
            }
        }
    }
}
