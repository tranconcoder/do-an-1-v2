import type { DiscountTypeEnum } from '@/enums/discount.enum';

declare global {
    namespace model {
        namespace discount {
            interface CommonType {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type DiscountSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    /* ----------------------- Information ---------------------- */
                    discount_shop: moduleTypes.mongoose.ObjectId;
                    discount_name: string;
                    discount_description?: string;
                    discount_code: string;
                    discount_type: DiscountTypeEnum;
                    discount_value: number;
                    discount_spus: Array<string>;

                    /* ------------------------- History ------------------------ */
                    discount_used_count: number;

                    /* ---------------------- Limit usages ---------------------- */
                    discount_count?: number;
                    discount_max_value?: number;
                    discount_user_max_use?: number;
                    discount_min_order_cost?: number;

                    /* ----------------------- Time range ----------------------- */
                    discount_start_at: Date;
                    discount_end_at: Date;

                    /* ------------------------ Metadata ------------------------ */
                    is_publish?: boolean;
                    is_apply_all_product?: boolean;
                    is_admin_voucher?: boolean;
                    is_available?: boolean;
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
