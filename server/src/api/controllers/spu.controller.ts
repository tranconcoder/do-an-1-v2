import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { RequestWithBody, RequestWithParams, RequestWithQuery } from '@/types/request.js';
import spuService from '@/services/spu.service.js';
import { SPUImages } from '@/enums/spu.enum.js';
import { RequestHandler } from 'express';

export default new (class SPUController {
    /* ---------------------------------------------------------- */
    /*                            Crate                           */
    /* ---------------------------------------------------------- */
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

    /* ---------------------------------------------------------- */
    /*                             Get                            */
    /* ---------------------------------------------------------- */

    /* ------------------- Get all spu by shop ------------------ */
    getAllSPUOwnByShop: RequestWithQuery<commonTypes.object.PageSlitting> = async (
        req,
        res,
        next
    ) => {
        new OkResponse({
            message: 'Get all products by shop successfully!',
            metadata: await spuService.getAllSPUOwnByShop({
                userId: req.userId as string,
                page: req.query.page,
                limit: req.query.limit
            })
        }).send(res);
    };

    /* ----------------- Get all spu shop by all ---------------- */
    getAllSPUShopByAll: RequestWithQuery<commonTypes.object.PageSlitting> = async (req, res, _) => {
        new OkResponse({
            message: 'Get all products by shop successfully!',
            metadata: await spuService.getAllSPUShopByAll({
                page: req.query.page,
                limit: req.query.limit
            })
        }).send(res);
    };

    /* ----------------------- Publish SPU ---------------------- */
    publishSPU: RequestWithParams<{ spuId: string }> = async (req, res, _) => {
        new OkResponse({
            message: 'Publish product successfully!',
            metadata: await spuService.publishSPU({
                userId: req.userId as string,
                spuId: req.params.spuId
            })
        }).send(res);
    };

    /* ------------------------ Draft SPU ----------------------- */
    draftSPU: RequestWithParams<{ spuId: string }> = async (req, res, _) => {
        new OkResponse({
            message: 'Draft product successfully!',
            metadata: await spuService.unpublishSPU({
                userId: req.userId as string,
                spuId: req.params.spuId
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    deleteSPU: RequestWithParams<{ id: string }> = async (req, res, next) => {
        new OkResponse({
            message: 'Delete product successfully!',
            metadata: await spuService.deleteSPU(req.params.id)
        }).send(res);
    };
})();
