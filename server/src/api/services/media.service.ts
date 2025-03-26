import mediaModel from '@/models/media.model.js';
import { findOneAndUpdateMedia, findOneMedia } from '@/models/repository/media/index.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import { createMedia } from '@/validations/joi/media.joi.js';
import fs from 'fs/promises';

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
        /* -------------------- Check media info -------------------- */
        return await findOneAndUpdateMedia({
            query: {
                _id: mediaId
            },
            update: {
                is_deleted: true,
                deleted_at: new Date()
            }
        });
    }

    /* ---------------------- Hard delete  ---------------------- */
    async hardRemoveMedia(mediaId: string) {
        /* -------------------- Check media info -------------------- */
        const mediaInfo = await findOneMedia({ query: { _id: mediaId } });
        if (!mediaInfo) throw new NotFoundErrorResponse('Media not found!');

        /* --------------------- Remove media file ------------------- */
        const filePath = `${mediaInfo.media_filePath}/${mediaInfo.media_fileName}`;
        if (await fs.exists(filePath)) await fs.unlink(filePath);

        /* ---------------------- Remove media info ------------------- */
        return await mediaInfo.deleteOne();
    }
})();
