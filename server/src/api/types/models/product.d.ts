import type { Document, HydratedDocument, Model, Models } from 'mongoose';
import type mongoose from 'mongoose';
import type { CategoryEnum } from '../../enums/product.enum';
import { Product } from '../../services/product';
import { productModel } from '../../models/product.model';

declare global {
    namespace modelTypes {
        namespace product {
            type ProductListKey = keyof typeof CategoryEnum;
            type ProductList = CategoryEnum;

            type ProductSchemaList<T = false> = Partial<
                PhoneSchema<T> & ClothesSchema<T>
            >;
            type ProductUnion<T = false> = PhoneSchema<T> | ClothesSchema<T>;

            type CommonFields = {
                _id: mongoose.Types.ObjectId | string;
                product_shop: mongoose.Types.ObjectId | string;
            };

            type MongooseInit<isModel, isDocument, T> =
                moduleTypes.mongoose.MongooseType<
                    T & CommonFields,
                    isModel,
                    isDocument
                >;

            type ProductSchema<isModel = false, isDoc = false> = MongooseInit<
                isModel,
                isDoc,
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
                }
            >;

            type PhoneSchema<isMode = false, isDoc = false> = MongooseInit<
                isMode,
                isDoc,
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
                }
            >;

            type ClothesSchema<isModel = false, isDoc = false> = MongooseInit<
                isModel,
                isDoc,
                {
                    size: string;
                    color: string;
                }
            >;

        }
    }
}
