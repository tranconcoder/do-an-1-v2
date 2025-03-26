import multer from 'multer';
import mediaConstants from '@/constants/media.constants.js';
import { AVATAR_MAX_SIZE, AVATAR_BASE_PATH } from '@/configs/media.config.js';
import path from 'path';
import { MediaExtensions, MediaMimeTypes } from '@/enums/media.enum.js';
import { InvalidPayloadErrorResponse } from '@/response/error.response.js';


/* ---------------------------------------------------------- */
/*                           Avatar                           */
/* ---------------------------------------------------------- */
export const uploadAvatar = multer({
    storage: mediaConstants.avatarStorage,
    limits: { fields: AVATAR_MAX_SIZE },
    dest: AVATAR_BASE_PATH,
    fileFilter: (_, file, cb) => {
        /* -------------------- Check extension  -------------------- */
        const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
        if (!Object.values(MediaExtensions).includes(extname as any))
            return cb(new InvalidPayloadErrorResponse('Invalid file extension') as Error);

        /* --------------------- Check mimetype --------------------- */
        const mimetype = file.mimetype;
        if (!Object.values(MediaMimeTypes).includes(mimetype as any))
            return cb(new InvalidPayloadErrorResponse('Invalid file mime type') as Error);

        cb(null, true);
    }
});
