import '';

declare global {
    namespace joiTypes {
        namespace spu {
            interface CreateSPU
                extends Omit<
                    service.spu.arguments.CreateSPU,
                    | 'product_shop'
                    | 'product_thumb'
                    | 'product_images'
                    | 'product_quantity'
                    | 'mediaIds'
                > { }

            interface UpdateSPU
                extends Omit<
                    service.spu.arguments.UpdateSPU,
                    | 'spuId'
                    | 'userId'
                    | 'product_thumb'
                    | 'product_images'
                    | 'mediaIds'
                > { }
        }
    }
}
