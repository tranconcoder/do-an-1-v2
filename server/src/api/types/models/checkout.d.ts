import type { DiscountTypeEnum } from '@/enums/discount.enum.js';

declare global {
    namespace model {
        namespace checkout {
            interface CommonTypes {
                _id: string;
            }

            type CheckoutSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    user: moduleTypes.mongoose.ObjectId;
                    total_price_raw: number;
                    total_fee_ship: number;
                    total_discount_shop_price: number;
                    total_discount_admin_price: number;
                    total_discount_price: number;
                    total_checkout: number;
                    discount?: {
                        discount_id: moduleTypes.mongoose.ObjectId;
                        discount_code: string;
                        discount_name: string;
                        discount_type: DiscountTypeEnum;
                        discount_value: number;
                    };
                    shops_info: Array<{
                        shop_id: string;
                        shop_name: string;
                        discount?: {
                            discount_id: moduleTypes.mongoose.ObjectId;
                            discount_code: string;
                            discount_name: string;
                            discount_type: DiscountTypeEnum;
                            discount_value: number;
                        };
                        products_info: Array<{
                            id: string;
                            name: string;
                            quantity: number;
                            thumb: string;
                            price: number;
                            price_raw: number;
                        }>;
                        fee_ship: number;
                        total_price_raw: number;
                        total_discount_price: number;
                    }>;
                    ship_info: string;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
