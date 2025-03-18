import '';

declare global {
    namespace modelTypes {
        namespace checkout {
            interface CommonTypes {
                _id: string;
            }

            type CheckoutSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    user: moduleTypes.mongoose.ObjectId;
                    totalPriceRaw: number;
                    totalFeeShip: number;
                    totalDiscountShopPrice: number;
                    totalDiscountAdminPrice: number;
                    totalDiscountPrice: number;
                    totalCheckout: number;
                    shopsInfo: Array<{
                        shopId: string;
                        shopName: string;
                        productsInfo: Array<{
                            id: string;
                            name: string;
                            quantity: number;
                            thumb: string;
                            price: number;
                            priceRaw: number;
                        }>;
                        feeShip: number;
                        totalPriceRaw: number;
                        totalDiscountPrice: number;
                    }>;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
