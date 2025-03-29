import mediaService from '@/services/media.service.js';
import type { RequestWithParams } from '@/types/request.js';

export default new (class MediaController {
    getMediaFile: RequestWithParams<joiTypes.media.GetMediaFile> = async (req, res, next) => {
        res.sendFile(await mediaService.getMediaFile(req.params.id as string));
    };
})();
