import "";

declare global {
    namespace model {
        namespace wishlist {
            interface CommonFields {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type Wishlist<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    user: moduleTypes.mongoose.ObjectId;
                    products: moduleTypes.mongoose.ObjectId[];
                },
                isModel,
                isDoc,
                CommonFields
            >;
        }
    }
}