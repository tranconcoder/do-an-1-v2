import '';

declare global {
    namespace joiTypes {
        namespace warehouses {
            namespace arguments {
                interface CreateWarehouse
                    extends Omit<service.warehouses.arguments.CreateWarehouse, 'shop'> {}

                interface UpdateWarehouses extends Partial<CreateWarehouse> {
                    id: string;
                }
            }
        }
    }
}
