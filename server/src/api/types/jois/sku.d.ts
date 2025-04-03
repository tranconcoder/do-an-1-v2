import '';

declare global {
    namespace joiTypes {
        namespace sku {
            interface CreateSKU
                extends Omit<service.sku.arguments.CreateSKU, 'sku_thumb' | 'sku_images'> {
                warehouse: string;
            }
        }
    }
}
