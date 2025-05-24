import '';

declare global {
    namespace service {
        namespace redis {
            interface SetUserProfile extends Omit<model.auth.UserSchema, 'created_at' | 'updated_at' | '__v' | "password"> {
            }
        }
    }
}
