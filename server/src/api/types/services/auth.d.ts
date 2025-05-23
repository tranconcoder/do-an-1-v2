import '';

declare global {
    namespace service {
        namespace auth {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                interface LoginResponse {
                    user: Pick<
                        model.auth.UserSchema<true>,
                        'phoneNumber' | 'email' | 'fullName' | 'role' | '_id'
                    >;
                    token: service.jwt.definition.JwtPair;
                }
            }

            /* ====================================================== */
            /*                        ARGUMENTS                       */
            /* ====================================================== */
            namespace arguments {
                interface SignUp extends joiTypes.auth.SignUpSchema {}

                interface Login extends joiTypes.auth.LoginSchema {}

                interface ForgotPassword extends joiTypes.auth.ForgotPasswordSchema {}

                interface NewToken extends joiTypes.auth.NewTokenSchema {}
            }

            /* ====================================================== */
            /*                       RETURN TYPE                      */
            /* ====================================================== */
            namespace returnType {}
        }
    }
}
