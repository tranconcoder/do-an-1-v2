import type { ConvertObjectIdToString } from '../modules/mongoose';

declare global {
    namespace joiTypes {
        module auth {
            interface UserSchema
                extends moduleTypes.mongoose.ConvertObjectIdToString<model.auth.UserSchema> {}

            interface LoginSchema extends Pick<UserSchema, 'phoneNumber' | 'password'> {}

            interface SignUpSchema
                extends Pick<
                    model.auth.UserSchema,
                    'user_fullName' | 'password' | 'phoneNumber' | 'user_email'
                > {}

            interface SignUpShop
                extends Omit<model.shop.ShopSchema, 'shop_logo' | 'shop_userId'>,
                    LoginSchema {
                shop_location: model.location.LocationSource;
                warehouses: Array<{
                    name: string;
                    address: model.location.LocationSource;
                    phoneNumber: string;
                }>;
            }

            interface ForgotPasswordSchema {
                email: UserSchema['user_email'];
                newPassword: UserSchema['password'];
            }

            interface NewTokenSchema {
                refreshToken: string;
            }
        }
    }
}
