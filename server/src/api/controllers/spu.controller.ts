import { CreatedResponse } from '@/response/success.response.js';
import { RequestWithBody } from '@/types/request.js';
import spuService from '@/services/spu.service.js';
import { SPUImages } from '@/enums/spu.enum.js';

export default new (class SPUController {
    createSPU: RequestWithBody<joiTypes.spu.CreateSPU> = async (req, res, next) => {
        new CreatedResponse({
            message: 'Create product successfully!',
            metadata: await spuService.createSPU({
                ...req.body,
                product_shop: req.userId as string,
                product_thumb: req.mediaIds?.[SPUImages.PRODUCT_THUMB]?.[0] as string,
                product_images: req.mediaIds?.[SPUImages.PRODUCT_IMAGES] || [],
                mediaIds: req.mediaIds as NonNullable<typeof req.mediaIds>
            })
        }).send(res);
    };
})();
