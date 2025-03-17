import type { Document, HydratedDocument, Model, Models } from 'mongoose';
import type mongoose from 'mongoose';
import type { CategoryEnum } from '../../enums/product.enum';
import { Product } from '../../services/product';

declare global {
    namespace modelTypes {
        namespace product {
            type ProductListKey = keyof typeof CategoryEnum;
            type ProductList = CategoryEnum;

            type ProductSchemaList<T = false> = Partial<PhoneSchema<T> & ClothesSchema<T>>;
            type ProductUnion<T = false> = PhoneSchema<T> | ClothesSchema<T>;

            interface CommonFields {
                _id: mongoose.Types.ObjectId | string;
                product_shop: mongoose.Types.ObjectId | string;
            }

            type ProductSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    product_name: string;
                    product_cost: number;
                    product_thumb: string;
                    product_quantity: number;
                    product_description: string;
                    product_category: CategoryEnum;
                    product_attributes: ProductSchemaList<T>;
                    is_draft: boolean;
                    is_publish: boolean;
                    product_rating_avg: number;
                    product_slug: string;
                },
                isModel,
                isDoc,
                CommonFields
            >;

            type PhoneSchema<isMode = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    phone_processor: string;
                    phone_brand: string;
                    phone_memory: string;
                    phone_storage: number;
                    phone_color: string;
                    phone_battery: {
                        capacity: number;
                        battery_techology: string;
                        charge_technology?: string;
                    };
                    phone_warranty: string;
                    phone_camera: {
                        front?: string;
                        back?: string;
                    };
                    phone_screen: {
                        size: number;
                        resolution: {
                            width: number;
                            height: number;
                        };
                        technology: string;
                        max_brightness?: number;
                        refresh_rate?: number;
                    };
                    phone_connectivity: {
                        sim_count: number;
                        network: string;
                        usb: string;
                        wifi?: string;
                        bluetooth?: string;
                        gps?: string;
                    };
                    phone_special_features: Array<string>;
                    phone_material: string;
                    phone_weight: number;
                    is_smartphone: boolean;
                },
                isMode,
                isDoc,
                CommonFields
            >;

            type ClothesSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    size: string;
                    color: string;
                },
                isModel,
                isDoc,
                CommonFields
            >;
        }
    }
}
