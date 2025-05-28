import {
    generateValidateWithBody,
    generateValidateWithParams
} from '@/middlewares/zod.middleware.js';
import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import { zodId } from './index.js';
import { z } from 'zod';

/* ---------------------------------------------------------- */
/*                        Create Media                        */
/* ---------------------------------------------------------- */
export const createMediaSchema = z.object({
    /* ------------------- Common information ------------------- */
    media_title: z.string().min(1, 'Media title is required'),
    media_desc: z.string().optional(),

    /* -------------------- File information -------------------- */
    media_fileName: z.string().min(1, 'Media filename is required'),
    media_filePath: z.string().min(1, 'Media file path is required'),
    media_fileType: z.nativeEnum(MediaTypes, {
        errorMap: () => ({ message: 'Invalid media file type' })
    }),
    media_mimeType: z.nativeEnum(MediaMimeTypes, {
        errorMap: () => ({ message: 'Invalid media MIME type' })
    }),
    media_fileSize: z.number().min(0, 'File size must be a positive number'),
    media_parent: zodId.optional(),

    /* ------------------- Folder information ------------------- */
    media_isFolder: z.boolean().optional().default(false),

    /* ------------------------ Metadata ------------------------ */
    media_owner: zodId.optional()
});

export type CreateMediaSchema = z.infer<typeof createMediaSchema>;
export const validateCreateMedia = generateValidateWithBody(createMediaSchema);

/* ---------------------------------------------------------- */
/*                       Get Media File                       */
/* ---------------------------------------------------------- */
export const getMediaFileSchema = z.object({
    id: zodId
});

export type GetMediaFileSchema = z.infer<typeof getMediaFileSchema>;
export const validateGetMediaFile = generateValidateWithParams(getMediaFileSchema);
