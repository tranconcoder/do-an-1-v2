import '';

declare global {
    namespace model {
        namespace warehouse {
            interface CommonTypes {}

            type WarehouseSchema<
                isModel = false,
                isDoc = false
            > = moduleTypes.mongoose.MongooseType<
                {
                    name: string;
                    address: moduleTypes.mongoose.ObjectId;
                    phoneNumber: string;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
