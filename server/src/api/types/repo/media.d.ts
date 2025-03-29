import '';

declare global {
    namespace repo {
        namespace media {
            namespace arguments {
                interface ChangeMediaOwner {
                    userId: string;
                    mediaId: string;
                }
            }
        }
    }
}
