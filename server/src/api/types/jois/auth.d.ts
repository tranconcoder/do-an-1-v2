import { ConvertObjectIdToString } from '../modules/mongoose';

declare global {
    namespace joiTypes {
        module auth {
            interface UserSchema
                extends moduleTypes.mongoose
                    .ConvertObjectIdToString<modelTypes.auth.UserSchema> {}

            interface LoginSchema
                extends Pick<UserSchema, 'phoneNumber' | 'password'> {}

            interface SignUpSchema
                extends Pick<
                    modelTypes.auth.UserSchema,
                    'email' | 'fullName' | 'password' | 'phoneNumber'
                > {}

            interface NewTokenSchema {
                refreshToken: string;
            }
        }
    }
}
