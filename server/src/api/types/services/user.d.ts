import '';

declare global {
    namespace serviceTypes {
        namespace user {
            /* ====================================================== */
            /*                        ARGUMENTS                       */
            /* ====================================================== */
            namespace arguments {
                interface NewInstance
                    extends modelTypes.auth.UserSchema<false, false> {}
            }
        }
    }
}
