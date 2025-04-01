import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import mediaService from '@/services/media.service.js';
import catchError from './catchError.middleware.js';
import { Multer } from 'multer';
import { ErrorRequestHandler } from 'express';
import LoggerService from '@/services/logger.service.js';

export const uploadSingleMedia = (
    field: string,
    multerMiddleware: Multer,
    title: string,
    isRequired = true
) =>
    catchError(async (req, res, next) => {
        multerMiddleware.single(field)(req, res, async (err) => {
            if (err) return next(err);

            try {
                /* -------------- Handle create media document -------------- */
                const file = req.file as Express.Multer.File | undefined;
                if (isRequired && !file) {
                    throw new NotFoundErrorResponse({
                        message: `File '${field}' not found!`
                    });
                }

                if (file)
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

export const uploadMultipleMedia = (fields: Array<string>) => {

}

/* ---------------------------------------------------------- */
/*                      Clean up on error                     */
/* ---------------------------------------------------------- */
export const cleanUpMediaOnError: ErrorRequestHandler = async (error, req, res, next) => {
    /* ------------------- Handle remove media ------------------ */
    try {
        if (req.mediaId) await mediaService.hardRemoveMedia(req.mediaId);
        if (req.mediaIds) {
            await Promise.all(req.mediaIds.map((id) => mediaService.hardRemoveMedia(id)));
        }
    } catch (error: any) {
        const message = `Error when clean up media on error: ${error?.message}`;
        LoggerService.getInstance().error(message);

        return next(error);
    }

    next(error);
};
