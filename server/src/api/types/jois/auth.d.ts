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
                    'email' | 'fullName' | 'password' | 'phoneNumber'
                > {}

            interface NewTokenSchema {
                refreshToken: string;
            }
        }
    }
}
