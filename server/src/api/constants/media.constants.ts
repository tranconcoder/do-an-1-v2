import { AVATAR_BASE_PATH } from '@/configs/media.config.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { v4 } from 'uuid';

export default new (class MediaConstant {
    /* ---------------------------------------------------------- */
    /*                           Avatar                           */
    /* ---------------------------------------------------------- */
    avatarStorage = multer.diskStorage({
        destination: async (_req, _file, cb) => {
            await fs.mkdir(AVATAR_BASE_PATH, { recursive: true });
            cb(null, AVATAR_BASE_PATH);
        },
        filename: (_req, file, cb) => {
            const fileName = v4();
            const extname = path.extname(file.originalname);

            cb(null, `${fileName}${extname}`);
        }
    });
})();
