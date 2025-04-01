import { RequestHandler } from 'express';
import { ITEM_PER_PAGE } from 'src/configs/server.config.js';
import SuccessResponse, { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { RequestWithBody } from '@/types/request.js';
import spuService from '@/services/spu.service.js';

export default new (class SPUController {
    createSPU: RequestWithBody<any> = async (req, res, next) => {
        new CreatedResponse({
            message: 'Create product successfully!',
            metadata: await spuService.createSPU({
                product_shop: req.userId as string
            })
        });
    };
})();
