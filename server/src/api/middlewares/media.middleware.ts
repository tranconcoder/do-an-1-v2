import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import mediaService from '@/services/media.service.js';
import catchError from './catchError.middleware.js';
import { Field, Multer } from 'multer';
import { ErrorRequestHandler } from 'express';
import LoggerService from '@/services/logger.service.js';
import Joi from 'joi';

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
    fields: commonTypes.object.ObjectAnyKeys<[number, number]>,
    multerMiddleware: Multer,
    title: string
) =>
    catchError(async (req, res, next) => {
        const keys = Object.keys(fields);
        const fieldArray: Required<Field>[] = keys.map((key) => ({
            name: key,
            maxCount: fields[key][1]
        }));

        const filesSchema = Joi.object(
            Object.fromEntries(
                Object.keys(fields).map((key) => [
                    key,
                    Joi.array()
                        .items(Joi.object())
                        .min(fields[key][0])
                        .max(fields[key][1])
                        .required()
                ])
            )
        )
            .unknown()
            .required();

        multerMiddleware.fields(fieldArray)(req, res, async (err) => {
            if (err) return next(err);

            try {
                /* -------------- Handle create media document -------------- */
                const filesFields = (await filesSchema.validateAsync(
                    req.files || {}
                )) as commonTypes.object.ObjectAnyKeys<Express.Multer.File[]>;

                const mediaIds: commonTypes.object.ObjectAnyKeys<string[]> = (req.mediaIds = {});

                await Promise.all(
                    Object.keys(filesFields).map(async (key) => {
                        const files = filesFields[key];
                        mediaIds[key] = [];

                        await Promise.all(
                            files.map(async (file) => {
                                mediaIds[key].push(
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
                                );
                            })
                        );
                    })
                );

                console.log({ mediaIds });
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
            const mediaIds = req.mediaIds as commonTypes.object.ObjectAnyKeys<string[]>;

            await Promise.all(
                /* ---------------------- Handle field ---------------------- */
                Object.keys(mediaIds).map(async (field) => {
                    const mediaList = mediaIds[field];

                    /* ------------------------ Handle id ----------------------- */
                    await Promise.all(
                        mediaList.map(async (id) => {
                            await mediaService.hardRemoveMedia(id);
                        })
                    );
                })
            );
        }
    } catch (error: any) {
        const message = `Error when clean up media on error: ${error?.message}`;
        LoggerService.getInstance().error(message);

        return next(error);
    }

    next(error);
};
