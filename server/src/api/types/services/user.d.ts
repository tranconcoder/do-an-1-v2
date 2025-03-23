import '';

declare global {
    namespace service {
        namespace user {
            /* ====================================================== */
            /*                        ARGUMENTS                       */
            /* ====================================================== */
            namespace arguments {
                interface NewInstance extends model.auth.UserSchema<false, false> {}
            }
        }
    }
}
