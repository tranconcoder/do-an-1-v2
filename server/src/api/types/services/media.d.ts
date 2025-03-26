import '';

declare global {
    namespace service {
        namespace media {
            namespace arguments {
                interface UploadMedia extends model.media.MediaSchema {
                    buffer: Buffer;
                }
            }
        }
    }
}
