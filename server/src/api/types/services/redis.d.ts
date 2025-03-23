import '';

declare global {
    namespace service {
        namespace redis {
            interface SetUserProfile
                extends Pick<model.auth.UserSchema, 'phoneNumber' | 'email' | 'role' | 'fullName'> {
                id: string;
            }
        }
    }
}
