import '';

declare global {
    namespace zodTypes {
        namespace media {
            interface CreateMedia extends service.media.arguments.CreateMedia {}

            interface GetMediaFile {
                id: string;
            }
        }
    }
}
