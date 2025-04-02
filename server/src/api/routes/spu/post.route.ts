import { Router } from 'express';

/* ----------------------- Middleware ----------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { uploadFieldsMedia, uploadSingleMedia } from '@/middlewares/media.middleware.js';
import { uploadSPU } from '@/middlewares/multer.middleware.js';

/* -------------------------- Enum -------------------------- */
import { Resources } from '@/enums/rbac.enum.js';
import { SPUImages } from '@/enums/spu.enum.js';

import spuController from '@/controllers/spu.controller.js';
import { createSPU } from '@/validations/joi/spu.joi.js';
import { SKUImages } from '@/enums/sku.enum.js';

const spuPostRoute = Router();

/* --------------------- Create product --------------------- */
spuPostRoute.post(
    '/create',

    authorization('createOwn', Resources.PRODUCT),

    /* ---------------------- Upload images --------------------- */
    uploadFieldsMedia(
        {
            /* --------------------------- SPU -------------------------- */
            [SPUImages.PRODUCT_THUMB]: [1, 1],
            [SPUImages.PRODUCT_IMAGES]: [3, 10],

            /* --------------------------- SKU -------------------------- */
            [SKUImages.SKU_THUMB]: [0, 30],
            [SKUImages.SKU_IMAGES]: [0, 150]
        },
        uploadSPU,
        'Product images'
    ),

    validateRequestBody(createSPU),
    catchError(spuController.createSPU)
);

export default spuPostRoute;
