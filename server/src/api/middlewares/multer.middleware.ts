import multer from 'multer';
import { avatarStorage, spuStorage } from '@/constants/media.constants.js';
import { AVATAR_MAX_SIZE, CATEGORY_MAX_SIZE } from '@/configs/media.config.js';
import path from 'path';
import { MediaExtensions, MediaMimeTypes } from '@/enums/media.enum.js';
import { InvalidPayloadErrorResponse } from '@/response/error.response.js';
import { Request } from 'express';

function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
    /* -------------------- Check extension  -------------------- */
    const extname = path.extname(file.originalname).toLowerCase().replace('.', '');

    if (!Object.values(MediaExtensions).includes(extname as any))
        return cb(
            new InvalidPayloadErrorResponse({
                message: 'Invalid file extension'
            }) as any as Error
        );

    /* --------------------- Check mimetype --------------------- */
    const mimetype = file.mimetype;
    if (!Object.values(MediaMimeTypes).includes(mimetype as any))
        return cb(
            new InvalidPayloadErrorResponse({
                message: 'Invalid file mime type'
            }) as any as Error
        );

    cb(null, true);
}

/* ---------------------------------------------------------- */
/*                           Avatar                           */
/* ---------------------------------------------------------- */
export const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fields: AVATAR_MAX_SIZE },
    fileFilter
});

/* ---------------------------------------------------------- */
/*                          Category                          */
/* ---------------------------------------------------------- */
export const uploadCategory = multer({
    storage: avatarStorage,
    limits: { fields: CATEGORY_MAX_SIZE },
    fileFilter
});

/* ---------------------------------------------------------- */
/*                             SPU                            */
/* ---------------------------------------------------------- */
export const uploadSPU = multer({
    storage: spuStorage,
    limits: { fields: 100 * 1024 * 1024 }, // 100MB
    fileFilter
});
