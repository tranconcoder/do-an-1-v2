import { AVATAR_BASE_PATH } from '@/configs/media.config.js';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';

export default new (class MediaConstant {
    /* ---------------------------------------------------------- */
    /*                           Avatar                           */
    /* ---------------------------------------------------------- */
    avatarStorage = multer.diskStorage({
        destination: async (_req, _file, cb) => {
            await fs.mkdir(AVATAR_BASE_PATH, { recursive: true });
            cb(null, AVATAR_BASE_PATH);
        },
        filename: (req, file, cb) => {
            cb(null, `${req.userId}${path.extname(file.originalname)}`);
        }
    });
})();
