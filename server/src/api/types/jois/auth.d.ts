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

            interface SignUpShop extends model.shop.ShopSchema {}

            interface NewTokenSchema {
                refreshToken: string;
            }
        }
    }
}
