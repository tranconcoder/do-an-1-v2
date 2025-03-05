import type { JwtPayload as BaseJwtPaylaod, SignOptions } from 'jsonwebtoken';
import { isArguments } from 'lodash';

declare global {
    namespace serviceTypes {
        namespace jwt {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                interface JwtPair {
                    accessToken: string;
                    refreshToken: string;
                }

                interface JwtPayload
                    extends moduleTypes.mongoose.ConvertObjectIdToString<
                        Pick<modelTypes.auth.UserSchema<true>, 'role'>
                    > {
                    id: string;
                }

                interface JwtDecode
                    extends JwtPayload,
                        Required<Pick<BaseJwtPaylaod, 'iat' | 'exp'>> {}
            }

            /* ====================================================== */
            /*                        ARGUMENTS                       */
            /* ====================================================== */
            namespace arguments {
                interface JwtSign {
                    privateKey: string;
                    payload: definition.JwtPayload;
                    type: keyof definition.JwtPair;
                }

                interface JwtSignPair extends Omit<JwtSign, 'type'> {}

                interface VerifyJwt {
                    token: string;
                    publicKey: string;
                }

                type ParseJwtPayload = definition.JwtDecode | null;
            }

            /* ====================================================== */
            /*                       RETURN TYPE                      */
            /* ====================================================== */
            namespace returnType {
                type VerifyJwt = Promise<null | definition.JwtDecode>;
            }

            namespace utils {
                type JwtConfig = {
                    [key in keyof serviceTypes.jwt.definition.JwtPair]: {
                        options: SignOptions;
                    };
                };
            }
        }
    }
}
