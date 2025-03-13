import '';

declare global {
    namespace serviceTypes {
        namespace key {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                type PublicKey = string;
                type PrivateKey = PublicKey;

                interface KeyTokenPair {
                    publicKey: string;
                    privateKey: string;
                }
            }

            /* ====================================================== */
            /*                        ARGUMENTS                       */
            /* ====================================================== */
            namespace arguments {
                interface SaveKeyToken {
                    userId: string;
                    privateKey: string;
                    publicKey: string;
                    refreshToken: string;
                }

                interface ReplaceRefreshTokenWithNew {
                    userId: string;
                    refreshToken: string;
                    oldRefreshToken: string;
                }
            }
        }
    }
}
