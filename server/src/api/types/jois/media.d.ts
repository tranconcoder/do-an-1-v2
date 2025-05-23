import '';

declare global {
    namespace joiTypes {
        namespace media {
            interface CreateMedia extends service.media.arguments.CreateMedia {}

            interface GetMediaFile {
                id: moduleTypes.mongoose.ObjectId;
            }
        }
    }
}
