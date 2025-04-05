import '';

declare global {
    namespace model {
        namespace sku {
            interface CommonFields {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type SKU<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    sku_product: moduleTypes.mongoose.ObjectId;
                    sku_price: number;
                    sku_stock: number;
                    sku_thumb: moduleTypes.mongoose.ObjectId;
                    sku_images: Array<moduleTypes.mongoose.ObjectId>;
                    sku_tier_idx: Array<number>;

                    is_deleted: boolean;
                },
                isModel,
                isDoc,
                CommonFields
            >;
        }
    }
}
