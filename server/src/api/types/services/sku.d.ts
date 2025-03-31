import '';

declare global {
    namespace service {
        namespace sku {
            interface CreateSKU extends Omit<model.sku.SKU, '_id'> {}
        }
    }
}
