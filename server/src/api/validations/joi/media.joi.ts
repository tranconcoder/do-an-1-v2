import { mongooseId } from '@/configs/joi.config.js';
import Joi from 'joi';

export const createMedia = Joi.object<joiTypes.media.CreateMedia>({
    /* ------------------- Common information ------------------- */
    media_title: Joi.string().required(),
    media_desc: Joi.string(),

    /* -------------------- File information -------------------- */
    media_fileName: Joi.string().required(),
    media_filePath: Joi.string().required(),
    media_fileType: Joi.string().required(),
    media_mimeType: Joi.string().required(),
    media_fileSize: Joi.number().min(0).required(),
    media_parent: mongooseId,

    /* ------------------- Folder information ------------------- */
    media_isFolder: Joi.boolean(),
    media_childrenList: Joi.array().items(Joi.string()).default([]),

    /* ------------------------ Metadata ------------------------ */
    media_owner: mongooseId.optional()
});
