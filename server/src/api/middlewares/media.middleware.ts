import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import mediaService from '@/services/media.service.js';
import catchError from './catchError.middleware.js';
import { Field, Multer } from 'multer';
import { ErrorRequestHandler, Request } from 'express';
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

export const uploadFieldsMedia = (
    fields: commonTypes.object.ObjectAnyKeys<number>,
    multerMiddleware: Multer,
    title: string
) =>
    catchError(async (req, res, next) => {
        const keys = Object.keys(fields).filter((key) => fields[key] > 0);
        const fieldArray: Field[] = keys.map((key) => ({ name: key, maxCount: fields[key] }));
        const fileCount = fieldArray.reduce((acc, field) => acc + (field.maxCount as number), 0);

        multerMiddleware.fields(fieldArray)(req, res, async (err) => {
            if (err) return next(err);

            try {
                /* -------------- Handle create media document -------------- */
                const filesFields = req.files as
                    | commonTypes.object.ObjectAnyKeys<Express.Multer.File[]>
                    | undefined;

                const uploadedFileCount = Object.values(filesFields || {}).reduce(
                    (acc, file) => acc + file.length,
                    0
                );
                if (!filesFields || uploadedFileCount === 0 || uploadedFileCount < fileCount) {
                    throw new NotFoundErrorResponse({
                        message: `Files '${keys.join(', ')}' not found!`
                    });
                }

                req.mediaIds = {};
                const mediaIds = req.mediaIds;

                await Promise.all(
                    Object.keys(filesFields).map(async (key) => {
                        const files = filesFields[key];
                        const ids = await Promise.all(
                            files.map(
                                async (file) =>
                                    await mediaService
                                        .createMedia({
                                            media_title: title,
                                            media_desc: `Media for '${key}'`,
                                            media_fileName: file.filename,
                                            media_filePath: file.path,
                                            media_fileType: MediaTypes.IMAGE,
                                            media_mimeType: file.mimetype as MediaMimeTypes,
                                            media_fileSize: file.size,
                                            media_isFolder: false
                                        })
                                        .then((x) => x.id as string)
                            )
                        );

                        mediaIds[key] = ids;
                    })
                );

                next();
            } catch (err) {
                next(err);
            }
        });
    });
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
