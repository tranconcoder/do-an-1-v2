import type { DiscountTypeEnum } from '@/enums/discount.enum';

declare global {
    namespace modelTypes {
        namespace discount {
            interface CommonType {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type DiscountSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    discount_shop: moduleTypes.mongoose.ObjectId;
                    discount_name: string;
                    discount_description?: string;
                    discount_code: string;
                    discount_type: DiscountTypeEnum;
                    discount_value: number;
                    discount_count?: number;
                    discount_used_count?: number;
                    discount_min_order_cost?: number; // Minimum cost to apply discount
                    discount_products?: Array<moduleTypes.mongoose.ObjectId>;
                    discount_start_at: Date;
                    discount_end_at: Date;
                    discount_max_value?: number;
                    discount_user_max_use?: number;
                    is_apply_all_product?: boolean;
                    is_available?: boolean;
                    is_publish?: boolean;
                    is_admin_voucher?: boolean;
                },
                isModel,
                isDoc,
                CommonType
            >;

            type DiscountUsed<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    discount_used_discount: moduleTypes.mongoose.ObjectId;
                    discount_used_code: string;
                    discount_used_user: moduleTypes.mongoose.ObjectId;
                    discount_used_shop: moduleTypes.mongoose.ObjectId;
                    discount_used_at: Date;
                },
                isModel,
                isDoc,
                CommonType
            >;
        }
    }
}
