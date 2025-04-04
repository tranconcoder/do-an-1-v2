import type { ShopStatus, ShopType } from '@/enums/shop.enum.ts';
import { InsertOneModel } from 'mongoose';

declare global {
    namespace model {
        namespace shop {
            interface CommonTypes {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type ShopSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    /* -------------------- Shop information -------------------- */
                    shop_userId: moduleTypes.mongoose.ObjectId;
                    shop_name: string;
                    shop_email: string;
                    shop_logo: moduleTypes.mongoose.ObjectId;
                    shop_type: ShopType;
                    shop_certificate: string;
                    shop_location: moduleTypes.mongoose.ObjectId;
                    shop_phoneNumber: string;
                    shop_description: string;

                    /* ----------------------- Shop owner ----------------------- */
                    shop_owner_fullName: string;
                    shop_owner_email: string;
                    shop_owner_phoneNumber: string;
                    shop_owner_cardID: string;

                    /* --------------------- Shop status --------------------- */
                    shop_status: ShopStatus;
                    is_brand: boolean;
                    is_deleted: boolean;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
