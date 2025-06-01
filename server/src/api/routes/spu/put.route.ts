import { Router } from 'express';
import spuController from '@/controllers/spu.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { Resources } from '@/enums/rbac.enum.js';
import { validateParamsId } from '@/configs/joi.config.js';
import { cleanUpMediaOnError, uploadFieldsMedia } from '@/middlewares/media.middleware.js';
import { uploadSPU } from '@/middlewares/multer.middleware.js';
import { SPUImages } from '@/enums/spu.enum.js';
import { SKUImages } from '@/enums/sku.enum.js';
import { validateUpdateSPU } from '@/validations/zod/spu.zod.js';

const productPutRoute = Router();

/* =================== Update product =================== */
productPutRoute.put(
    '/:spuId',
    authorization('updateOwn', Resources.PRODUCT),
    validateParamsId('spuId'),

    /* ---------------------- Upload images --------------------- */
    uploadFieldsMedia(
        {
            /* --------------------------- SPU -------------------------- */
            [SPUImages.PRODUCT_THUMB]: { min: 0, max: 1 },
            [SPUImages.PRODUCT_IMAGES]: { min: 0, max: 10 },

            /* --------------------------- SKU -------------------------- */
            [SKUImages.SKU_THUMB]: { min: 0, max: 30 },
            [SKUImages.SKU_IMAGES]: { min: 0, max: 150 }
        },
        uploadSPU,
        'Product images'
    ),

    validateUpdateSPU,
    catchError(spuController.updateSPU),
    cleanUpMediaOnError
);

export default productPutRoute;
