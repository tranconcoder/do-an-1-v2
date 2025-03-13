import { JwtPayload as JwtPayloadBase } from 'jsonwebtoken';

declare global {
    namespace joiTypes {
        namespace jwt {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                interface JwtPayload
                    extends serviceTypes.jwt.definition.JwtPayload {}

                interface JwtDecode
                    extends serviceTypes.jwt.definition.JwtDecode {}
            }
        }
    }
}
