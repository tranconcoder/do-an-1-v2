import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import mediaService from '@/services/media.service.js';
import catchError from './catchError.middleware.js';
import { Multer } from 'multer';

export const uploadSingleMedia = (field: string, multerMiddleware: Multer, title: string) =>
    catchError(async (req, res, next) => {
        multerMiddleware.single(field)(req, res, async (err) => {
            if (err) return next(err);

            try {
                /* -------------- Handle create media document -------------- */
                const file = req.file as Express.Multer.File | undefined;
                if (!file) {
                    throw new NotFoundErrorResponse({
                        message: `File '${field}' not found!`
                    });
                }

                req.mediaId = await mediaService
                    .createMedia({
                        media_title: title,
                        media_desc: `Media for '${field}'`,
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
