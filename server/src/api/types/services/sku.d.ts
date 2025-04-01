import '';

declare global {
    namespace service {
        namespace sku {
            namespace arguments {
                interface CreateSKU extends Omit<model.sku.SKU, '_id'> {}
            }
        }
    }
}
