import { mongooseId } from '@/configs/joi.config.js';
import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import Joi from 'joi';

export const createMedia = Joi.object<joiTypes.media.CreateMedia>({
    /* ------------------- Common information ------------------- */
    media_title: Joi.string().required(),
    media_desc: Joi.string(),

    /* -------------------- File information -------------------- */
    media_fileName: Joi.string().required(),
    media_filePath: Joi.string().required(),
    media_fileType: Joi.string()
        .valid(...Object.values(MediaTypes))
        .required(),
    media_mimeType: Joi.string()
        .valid(...Object.values(MediaMimeTypes))
        .required(),
    media_fileSize: Joi.number().min(0).required(),
    media_parent: mongooseId.optional(),

    /* ------------------- Folder information ------------------- */
    media_isFolder: Joi.boolean(),

    /* ------------------------ Metadata ------------------------ */
    media_owner: mongooseId.optional()
});

/* --------------------- Get media file --------------------- */
export const getMediaFile = Joi.object<joiTypes.media.GetMediaFile>({
    id: mongooseId
});
