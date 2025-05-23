import { MediaTypes, MediaMimeTypes } from '@/enums/media.enum.js';

declare global {
    namespace model {
        namespace media {
            interface CommonTypes {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type MediaSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    /* ------------------- Common information ------------------- */
                    media_title: string;
                    media_desc: string;

                    /* -------------------- File information -------------------- */
                    media_fileName: string;
                    media_filePath: string;
                    media_fileType: MediaTypes;
                    media_mimeType: MediaMimeTypes;
                    media_fileSize: number;
                    media_parent?: string;

                    /* ------------------- Folder information ------------------- */
                    media_isFolder: boolean;
                    media_childrenList: moduleTypes.mongoose.ObjectId[];

                    /* ------------------------ Metadata ------------------------ */
                    media_owner?: moduleTypes.mongoose.ObjectId;

                    accessed_at?: Date;

                    is_deleted?: boolean;
                    deleted_at?: Date;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
