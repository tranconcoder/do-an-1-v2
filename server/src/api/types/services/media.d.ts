import '';

declare global {
    namespace service {
        namespace media {
            namespace arguments {
                interface CreateMedia
                    extends Omit<
                        model.media.MediaSchema,
                        'deleted_at' | 'accessed_at' | 'media_childrenList' | '_id'
                    > {}
            }
        }
    }
}
