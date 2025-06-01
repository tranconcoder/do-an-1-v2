import { Router } from 'express';

/* ----------------------- Middleware ----------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { cleanUpMediaOnError, uploadFieldsMedia } from '@/middlewares/media.middleware.js';
import { uploadSPU } from '@/middlewares/multer.middleware.js';

/* -------------------------- Enum -------------------------- */
import { Resources } from '@/enums/rbac.enum.js';
import { SPUImages } from '@/enums/spu.enum.js';

import spuController from '@/controllers/spu.controller.js';
import { SKUImages } from '@/enums/sku.enum.js';
import { validateCreateSPU } from '@/validations/zod/spu.zod';

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

    validateCreateSPU,

    catchError(spuController.createSPU),

    cleanUpMediaOnError
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
