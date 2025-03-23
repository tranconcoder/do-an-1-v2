import '';

declare global {
    namespace serviceTypes {
        namespace redis {
            interface SetUserProfile
                extends Pick<
                    modelTypes.auth.UserSchema,
                    'phoneNumber' | 'email' | 'role' | 'fullName'
                > {
                id: string;
            }
        }
    }
}
