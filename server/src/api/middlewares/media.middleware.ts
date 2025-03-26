import { AvatarFields, MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import * as multerMiddleware from '@/middlewares/multer.middleware.js';
import mediaService from '@/services/media.service.js';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import catchError from './catchError.middleware.js';

export default new (class MediaMiddleware {
    /* ---------------------------------------------------------- */
    /*                           Avatar                           */
    /* ---------------------------------------------------------- */
    uploadAvatar = (uploadField: AvatarFields): RequestHandler =>
        catchError(async (req, res, next) => {
            multerMiddleware.uploadAvatar.single(uploadField)(req, res, async (err) => {
                if (err) throw err;

                /* -------------- Handle create media document -------------- */
                const file = req.file as Express.Multer.File;

                /* -------------------- Generate new id  -------------------- */
                req.userId = new mongoose.Types.ObjectId().toString();

                req.mediaId = (
                    await mediaService.createMedia({
                        media_title: file.originalname,
                        media_desc: 'Avatar',
                        media_fileName: file.filename,
                        media_filePath: file.path,
                        media_fileType: MediaTypes.IMAGE,
                        media_mimeType: file.mimetype as MediaMimeTypes,
                        media_fileSize: file.size,
                        media_isFolder: false,
                        media_owner: req.userId
                    })
                ).id;

                next();
            });
        });
})();
