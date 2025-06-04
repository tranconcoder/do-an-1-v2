import "";

declare global {
    namespace model {
        namespace review {
            interface CommonTypes {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type ReviewSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    /* ----------------------- Information ---------------------- */
                    review_content: string;
                    review_rating: number;
                    review_images: moduleTypes.mongoose.ObjectId[];

                    /* ----------------------- Reference ---------------------- */
                    user_id: moduleTypes.mongoose.ObjectId;
                    order_id: moduleTypes.mongoose.ObjectId;
                    shop_id: moduleTypes.mongoose.ObjectId;
                    sku_id: moduleTypes.mongoose.ObjectId;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
