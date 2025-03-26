import { MediaTypes, MediaMimeTypes } from '@/enums/media.enum.js';

declare global {
    namespace model {
        namespace media {
            interface CommonTypes {
                _id: string;
            }

            interface MediaSchema {
                /* ------------------- Common information ------------------- */
                media_title: string;
                media_desc: string;

                /* -------------------- File information -------------------- */
                media_fileName: string;
                media_filePath: string;
                media_fileType: MediaTypes;
                media_mimeType: MediaMimeTypes;
                media_fileSize: number;
                media_parent: string | null;

                /* ------------------- Folder information ------------------- */
                media_isFolder: boolean;
                media_childrenList: moduleTypes.mongoose.ObjectId[];

                /* ------------------------ Metadata ------------------------ */
                media_owner: moduleTypes.mongoose.ObjectId | null;
                deleted_at: Date | null;
                accessed_at: Date | null;
            }
        }
    }
}
