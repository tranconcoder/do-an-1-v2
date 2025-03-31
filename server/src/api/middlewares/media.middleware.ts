import { AvatarFields, MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import * as multerMiddleware from '@/middlewares/multer.middleware.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import mediaService from '@/services/media.service.js';
import { RequestHandler } from 'express';
import catchError from './catchError.middleware.js';

/* ---------------------------------------------------------- */
/*                           Avatar                           */
/* ---------------------------------------------------------- */
export const uploadAvatar = (uploadField: AvatarFields): RequestHandler =>
    catchError(async (req, res, next) => {
        multerMiddleware.uploadAvatar.single(uploadField)(req, res, async (err) => {
            if (err) return next(err);

            try {
                /* -------------- Handle create media document -------------- */
                const file = req.file as Express.Multer.File | undefined;
                if (!file) {
                    throw new NotFoundErrorResponse({
                        message: `File '${uploadField}' not found!`
                    });
                }

                req.mediaId = await mediaService
                    .createMedia({
                        media_title: 'Avatar',
                        media_desc: `Avatar for '${uploadField}'`,
                        media_fileName: file.filename,
                        media_filePath: file.path,
                        media_fileType: MediaTypes.IMAGE,
                        media_mimeType: file.mimetype as MediaMimeTypes,
                        media_fileSize: file.size,
                        media_isFolder: false
                    })
                    .then((x) => x.id);

                next();
            } catch (err) {
                next(err);
            }
        });
    });
