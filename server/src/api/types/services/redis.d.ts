import '';

declare global {
    namespace service {
        namespace redis {
            interface SetUserProfile
                extends Pick<
                    model.auth.UserSchema,
                    'phoneNumber' | 'user_email' | 'user_role' | 'user_fullName'
                > {
                id: string;
            }
        }
    }
}
