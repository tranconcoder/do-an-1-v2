import { validateParamsId } from '@/configs/joi.config.js';
import spuController from '@/controllers/spu.controller.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { Router } from 'express';
import { cleanUpMediaOnError, uploadFieldsMedia } from '@/middlewares/media.middleware.js';
import { uploadSPU } from '@/middlewares/multer.middleware.js';
import { SPUImages } from '@/enums/spu.enum.js';
import { SKUImages } from '@/enums/sku.enum.js';
import { validateUpdateSPU } from '@/validations/zod/spu.zod.js';
import { generateValidateWithParamsId, parseJSONFields } from '@/middlewares/zod.middleware.js';

const patchRoute = Router();
const patchRouteValidate = Router();

/* ---------------------------------------------------------- */
/*                          Validate                          */
/* ---------------------------------------------------------- */
patchRoute.use(authenticate, patchRouteValidate);

/* ----------------------- Update SPU ----------------------- */
patchRouteValidate.put(
    '/update/:spuId',
    authorization('updateOwn', Resources.PRODUCT),
    generateValidateWithParamsId('spuId'),

    /* ---------------------- Upload images --------------------- */
    uploadFieldsMedia(
        {
            /* --------------------------- SPU -------------------------- */
            [SPUImages.PRODUCT_THUMB]: { min: 0, max: 1 },
            [SPUImages.PRODUCT_IMAGES]: { min: 0, max: 10 },

            /* --------------------------- SKU -------------------------- */
            [SKUImages.SKU_THUMB]: { min: 0, max: 30 },
            [SKUImages.SKU_IMAGES_TO_ADD]: { min: 0, max: 150 },
            [SKUImages.SKU_IMAGES_TO_REPLACE]: { min: 0, max: 150 }
        },
        uploadSPU,
        'Product update images'
    ),

    parseJSONFields([
        'product_attributes_to_add',
        'product_attributes_to_update',
        'product_attributes_to_remove',
        'sku_updates',
        'sku_images_map'
    ]),

    validateUpdateSPU,

    catchError(spuController.updateSPU),

    cleanUpMediaOnError
);

/* ----------------------- Publish SPU ---------------------- */
patchRouteValidate.patch(
    '/publish/:spuId',
    authorization('updateOwn', Resources.PRODUCT),
    validateParamsId('spuId'),
    catchError(spuController.publishSPU)
);

/* ------------------------ Draft SPU ----------------------- */
patchRouteValidate.patch(
    '/draft/:spuId',
    authorization('updateOwn', Resources.PRODUCT),
    validateParamsId('spuId'),
    catchError(spuController.draftSPU)
);

export default patchRoute;
