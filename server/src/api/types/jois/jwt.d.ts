import type { JwtPayload as JwtPayloadBase } from 'jsonwebtoken';






declare global {
    namespace joiTypes {
        namespace jwt {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                interface JwtPayload extends service.jwt.definition.JwtPayload {}

                interface JwtDecode extends service.jwt.definition.JwtDecode {}
            }
        }
    }
}
