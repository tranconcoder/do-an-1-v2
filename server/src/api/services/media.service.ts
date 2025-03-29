import mediaModel from '@/models/media.model.js';
import { findOneAndUpdateMedia, findOneMedia } from '@/models/repository/media/index.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import { createMedia } from '@/validations/joi/media.joi.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export default new (class MediaService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async createMedia(payload: service.media.arguments.CreateMedia) {
        /* ---------------------- Validate joi ---------------------- */
        const validated = await createMedia.validateAsync(payload);

        return await mediaModel.create(validated);
    }

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    /* ---------------------- Soft delete  ---------------------- */
    async softRemoveMedia(mediaId: string) {
        const REMOVE_LABEL = 'removed_';

        /* -------------------- Check media info -------------------- */
        const result = await findOneAndUpdateMedia({
            query: { _id: mediaId },
            update: [
                {
                    $set: {
                        is_deleted: true,
                        deleted_at: new Date(),
                        media_fileName: { $concat: [REMOVE_LABEL, '$media_fileName'] },
                        media_filePath: {
                            $let: {
                                vars: {
                                    folderDir: { $split: ['$media_filePath', '/'] }
                                },
                                in: {
                                    $concat: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $slice: [
                                                        '$$folderDir',
                                                        0,
                                                        {
                                                            $subtract: [
                                                                { $size: '$$folderDir' },
                                                                1 // Loại bỏ 2 phần tử cuối
                                                            ]
                                                        }
                                                    ]
                                                },
                                                initialValue: '',
                                                in: {
                                                    $concat: [
                                                        '$$value',
                                                        {
                                                            $cond: [
                                                                { $eq: ['$$value', ''] },
                                                                '',
                                                                '/'
                                                            ]
                                                        },
                                                        '$$this'
                                                    ]
                                                }
                                            }
                                        },
                                        '/',
                                        REMOVE_LABEL,
                                        '$media_fileName'
                                    ]
                                }
                            }
                        }
                    }
                }
            ],
            options: { lean: true }
        });

        console.log(result);

        /* ---------------------- Rename file  ---------------------- */
        const newFileName = REMOVE_LABEL + result.media_fileName;
        const newPath = `${result.media_filePath.split('/').slice(0, -1).join('/')}/${newFileName}`;
        console.log({ newFileName, newPath });

        if (existsSync(result.media_filePath)) await fs.rename(result.media_filePath, newPath);
    }

    /* ---------------------- Hard delete  ---------------------- */
    async hardRemoveMedia(mediaId: string) {
        /* -------------------- Check media info -------------------- */
        const mediaInfo = await findOneMedia({ query: { _id: mediaId } });
        if (!mediaInfo) throw new NotFoundErrorResponse({ message: 'Media not found!' });

        /* --------------------- Remove media file ------------------- */
        const filePath = mediaInfo.media_filePath;
        if (existsSync(filePath)) await fs.unlink(filePath);

        /* ---------------------- Remove media info ------------------- */
        return await mediaInfo.deleteOne();
    }

    /* ---------------------------------------------------------- */
    /*                           Upload                           */
    /* ---------------------------------------------------------- */

    /* --------------------- Upload avatar  --------------------- */
})();
