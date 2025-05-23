import '';

declare global {
    namespace service {
        namespace user {
            /* ====================================================== */
            /*                        ARGUMENTS                       */
            /* ====================================================== */
            namespace arguments {
                interface NewInstance
                    extends Omit<model.auth.UserSchema<false, false>, '_id' | 'avatar'> {}
            }
        }
    }
}
