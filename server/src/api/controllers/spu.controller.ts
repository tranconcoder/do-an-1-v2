import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { RequestWithBody, RequestWithParams, RequestWithQuery } from '@/types/request.js';
import spuService from '@/services/spu.service.js';
import { SPUImages } from '@/enums/spu.enum.js';
import { RequestHandler } from 'express';
import { findShopByUser } from '@/models/repository/shop';
import { CreateSPU } from '@/validations/zod/spu.zod';

export default new (class SPUController {
    /* ---------------------------------------------------------- */
    /*                            Crate                           */
    /* ---------------------------------------------------------- */
    createSPU: RequestWithBody<CreateSPU> = async (req, res, next) => {
        const shop = await findShopByUser({
            userId: req.userId!,
            options: {
                lean: true
            }
        });
        console.log("SHOP:::", shop);
        console.log("BODY:::", req.body);

        new CreatedResponse({
            message: 'Create product successfully!',
            metadata: await spuService.createSPU({
                product_shop: req.userId as string,
                product_thumb: req.mediaIds?.[SPUImages.PRODUCT_THUMB]?.[0] as string,
                product_images: req.mediaIds?.[SPUImages.PRODUCT_IMAGES] || [],
                mediaIds: req.mediaIds as NonNullable<typeof req.mediaIds>,
                is_draft: req.body.is_draft,
                is_publish: req.body.is_publish,
                product_attributes: req.body.product_attributes,
                product_category: req.body.product_category,
                product_description: req.body.product_description,
                product_name: req.body.product_name,
                product_variations: req.body.product_variations,
                sku_images_map: req.body.sku_images_map,
                sku_list: req.body.sku_list,
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                             Get                            */
    /* ---------------------------------------------------------- */

    /* ----------------------- Get SPU by ID ---------------------- */
    getSPUById: RequestWithParams<{ spuId: string }> = async (req, res, next) => {
        new OkResponse({
            message: 'Get product successfully!',
            metadata: await spuService.getSPUById({
                userId: req.userId as string,
                spuId: req.params.spuId
            })
        }).send(res);
    };

    /* ------------------- Get all spu by shop ------------------ */
    getAllSPUOwnByShop: RequestWithQuery<commonTypes.object.Pagination> = async (
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
    getAllSPUShopByAll: RequestWithQuery<commonTypes.object.Pagination> = async (req, res, _) => {
        new OkResponse({
            message: 'Get all products by shop successfully!',
            metadata: await spuService.getAllSPUShopByAll({
                page: req.query.page,
                limit: req.query.limit
            })
        }).send(res);
    };

    /* --------------------- Popular spu by all -------------------- */
    getPopularSPUByAll: RequestWithQuery<commonTypes.object.Pagination> = async (req, res, _) => {
        new OkResponse({
            message: 'Get popular products by all successfully!',
            metadata: await spuService.getPopularSPUByAll({
                page: req.query.page,
                limit: req.query.limit
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

    /* ----------------------- Update SPU ----------------------- */
    updateSPU: RequestWithParams<{ spuId: string }> & RequestWithBody<joiTypes.spu.UpdateSPU> = async (req, res, next) => {
        new OkResponse({
            message: 'Update product successfully!',
            metadata: await spuService.updateSPU({
                ...req.body,
                spuId: req.params.spuId,
                userId: req.userId as string,
                product_thumb: req.mediaIds?.[SPUImages.PRODUCT_THUMB]?.[0] as string,
                product_images: req.mediaIds?.[SPUImages.PRODUCT_IMAGES] || [],
                mediaIds: req.mediaIds as NonNullable<typeof req.mediaIds>
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
