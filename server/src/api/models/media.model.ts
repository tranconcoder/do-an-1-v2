import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import { ObjectId, timestamps } from '@/configs/mongoose.config.js';
import { Schema, model } from 'mongoose';
import { USER_MODEL_NAME } from './user.model.js';

export const MEDIA_MODEL_NAME = 'Media';
export const MEDIA_COLLECTION_NAME = 'medias';

export const mediaSchema = new Schema<model.media.MediaSchema>({
    /* ------------------- Common information ------------------- */
    media_title: { type: String, required: true },
    media_desc: String,

    /* -------------------- File information -------------------- */
    media_fileName: { type: String, required: true },
    media_filePath: { type: String, required: true },
    media_fileType: { type: String, enum: MediaTypes, required: true },
    media_mimeType: { type: String, enum: MediaMimeTypes, required: true },
    media_fileSize: { type: Number, required: true },
    media_parent: { type: ObjectId, ref: MEDIA_MODEL_NAME, required: false },

    /* ------------------- Folder information ------------------- */
    media_isFolder: { type: Boolean, default: false },
    media_childrenList: {
        type: [{ type: ObjectId, ref: MEDIA_MODEL_NAME }],
        default: []
    },

    /* ------------------------ Metadata ------------------------ */
    media_owner: { type: ObjectId, ref: USER_MODEL_NAME, default: null },

    is_deleted: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },

    accessed_at: { type: Date, default: null },

}, {
    timestamps,
    collection: MEDIA_COLLECTION_NAME
});

export default model(MEDIA_MODEL_NAME, mediaSchema);
