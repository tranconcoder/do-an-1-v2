import multer from 'multer';
import { avatarStorage } from '@/constants/media.constants.js';
import {
    AVATAR_MAX_SIZE,
    AVATAR_BASE_PATH,
    CATEGORY_MAX_SIZE,
    CATEGORY_BASE_PATH
} from '@/configs/media.config.js';
import path from 'path';
import { MediaExtensions, MediaMimeTypes } from '@/enums/media.enum.js';
import { InvalidPayloadErrorResponse } from '@/response/error.response.js';

function fileFilter(
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
): void {
    /* -------------------- Check extension  -------------------- */
    const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
    console.log(`Invalid file extension: ${extname}`);

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
    dest: AVATAR_BASE_PATH,
    fileFilter
});

/* ---------------------------------------------------------- */
/*                          Category                          */
/* ---------------------------------------------------------- */
export const uploadCategory = multer({
    storage: avatarStorage,
    limits: { fields: CATEGORY_MAX_SIZE },
    dest: CATEGORY_BASE_PATH,
    fileFilter
});
