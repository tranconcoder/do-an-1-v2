import '';

declare global {
    namespace service {
        namespace warehouses {
            namespace arguments {
                interface CreateWarehouse
                    extends Omit<model.warehouse.WarehouseSchema, '_id' | 'address'> {
                    location: service.location.CreateLocation;
                }

                interface UpdateWarehouses extends Partial<CreateWarehouse> {
                    id: string;
                }
            }
        }
    }
}
