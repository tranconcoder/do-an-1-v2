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

/* ---------------------------------------------------------- */
/*                       Create product                       */
/* ---------------------------------------------------------- */
spuPostRoute.post(
    '/create',

    authorization('createOwn', Resources.PRODUCT),

    /* ---------------------- Upload images --------------------- */
    uploadFieldsMedia(
        {
            /* --------------------------- SPU -------------------------- */
            [SPUImages.PRODUCT_THUMB]: { min: 1, max: 1 },
            [SPUImages.PRODUCT_IMAGES]: { min: 3, max: 10 },

            /* --------------------------- SKU -------------------------- */
            [SKUImages.SKU_THUMB]: { min: 0, max: 30 },
            [SKUImages.SKU_IMAGES]: { min: 0, max: 150 }
        },
        uploadSPU,
        'Product images'
    ),

    validateRequestBody(createSPU),
    catchError(spuController.createSPU)
);

/* ---------------------------------------------------------- */
/*                           Get SPU                          */
/* ---------------------------------------------------------- */

spuPostRoute.get(
    '/shop/all/own',
    authorization('readOwn', Resources.PRODUCT),
    catchError(spuController.getAllSPUOwnByShop)
);

export default spuPostRoute;
