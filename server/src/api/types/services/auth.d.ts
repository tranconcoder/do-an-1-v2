import '';

declare global {
    namespace serviceTypes {
        namespace auth {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                interface LoginResponse {
                    user: Pick<
                        modelTypes.auth.UserSchema<true>,
                        'phoneNumber' | 'email' | 'fullName' | 'role' | '_id'
                    >;
                    token: serviceTypes.jwt.definition.JwtPair;
                }
            }

            /* ====================================================== */
            /*                        ARGUMENTS                       */
            /* ====================================================== */
            namespace arguments {
                interface SignUp extends joiTypes.auth.SignUpSchema {}

                interface Login extends joiTypes.auth.LoginSchema {}

                interface NewToken extends joiTypes.auth.NewTokenSchema {}
            }

            /* ====================================================== */
            /*                       RETURN TYPE                      */
            /* ====================================================== */
            namespace returnType {}
        }
    }
}
