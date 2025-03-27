import type { JwtPayload as BaseJwtPayload, SignOptions } from 'jsonwebtoken';
import { isArguments } from 'lodash';

declare global {
    namespace service {
        namespace jwt {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                interface JwtPair {
                    accessToken: string;
                    refreshToken: string;
                }

                interface JwtPayload {
                    id: string;
                    role: string;
                }

                interface JwtDecode
                    extends JwtPayload,
                        Required<Pick<BaseJwtPayload, 'iat' | 'exp'>> {}

                type JwtConfig = {
                    [key in keyof service.jwt.definition.JwtPair]: {
                        options: SignOptions;
                    };
                };
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
        }
    }
}
