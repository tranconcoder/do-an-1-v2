import type { ConvertObjectIdToString } from '../modules/mongoose';

declare global {
    namespace joiTypes {
        module auth {
            interface UserSchema
                extends moduleTypes.mongoose.ConvertObjectIdToString<
                    Omit<model.auth.UserSchema, '_id' | 'avatar'>
                > {}

            interface LoginSchema extends Pick<UserSchema, 'phoneNumber' | 'password'> {}

            interface SignUpSchema
                extends Pick<
                    model.auth.UserSchema,
                    'email' | 'fullName' | 'password' | 'phoneNumber'
                > {}

            interface SignUpShop extends Omit<model.shop.ShopSchema, 'shop_logo' | "shop_userId"> {
                shop_location: model.location.LocationSource;
                shop_warehouses: Array<{
                    name: string;
                    address: model.location.LocationSource;
                    phoneNumber: string;
                }>;
            }

            interface NewTokenSchema {
                refreshToken: string;
            }
        }
    }
}
