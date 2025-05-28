import mediaService from '@/services/media.service.js';
import type { RequestWithParams } from '@/types/request.js';
import type { GetMediaFileSchema } from '@/validations/zod/media.zod.js';

export default new (class MediaController {
    getMediaFile: RequestWithParams<{ id: string }> = async (req, res, next) => {
        try {
            // Set CORS headers specifically for media files
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

            // Get and serve the file
            const filePath = await mediaService.getMediaFile(req.params.id as string);
            res.sendFile(filePath);
        } catch (error) {
            next(error);
        }
    };
})();
