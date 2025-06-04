import { Router } from 'express';
import productController from '@/controllers/product.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { Resources } from '@/enums/rbac.enum.js';
import { validateParamsId } from '@/configs/joi.config.js';
import { uploadFieldsMediaOptional } from '@/middlewares/media.middleware.js';
import { uploadSPU } from '@/middlewares/multer.middleware.js';
import { SPUImages } from '@/enums/spu.enum.js';
import { SKUImages } from '@/enums/sku.enum.js';

const productRoute = Router();

// All routes require authentication
productRoute.use(authenticate);

/* ----------------------- Get Product for Edit ----------------------- */
productRoute.get(
    '/:productId',
    authorization('readOwn', Resources.PRODUCT),
    validateParamsId('productId'),
    catchError(productController.getProductForEdit)
);

/* ----------------------- Update Product Info ----------------------- */
productRoute.patch(
    '/:productId/info',
    authorization('updateOwn', Resources.PRODUCT),
    validateParamsId('productId'),
    catchError(productController.updateProductInfo)
);

/* ----------------------- Update Product Media ----------------------- */
productRoute.patch(
    '/:productId/media',
    authorization('updateOwn', Resources.PRODUCT),
    validateParamsId('productId'),
    uploadFieldsMediaOptional(
        {
            [SPUImages.PRODUCT_THUMB]: { min: 0, max: 1 },
            [SPUImages.PRODUCT_IMAGES]: { min: 0, max: 10 }
        },
        uploadSPU,
        'Product media'
    ),
    catchError(productController.updateProductMedia)
);

/* ----------------------- Delete Product Media ----------------------- */
productRoute.delete(
    '/:productId/media',
    authorization('updateOwn', Resources.PRODUCT),
    validateParamsId('productId'),
    catchError(productController.deleteProductMedia)
);

/* ----------------------- Update SKU ----------------------- */
productRoute.patch(
    '/sku/:skuId',
    authorization('updateOwn', Resources.PRODUCT),
    validateParamsId('skuId'),
    catchError(productController.updateSKU)
);

/* ----------------------- Create SKU ----------------------- */
productRoute.post(
    '/:productId/sku',
    authorization('updateOwn', Resources.PRODUCT),
    validateParamsId('productId'),
    uploadFieldsMediaOptional(
        {
            [SKUImages.SKU_THUMB]: { min: 0, max: 1 },
            [SKUImages.SKU_IMAGES]: { min: 0, max: 10 }
        },
        uploadSPU,
        'SKU media'
    ),
    catchError(productController.createSKU)
);

/* ----------------------- Delete SKU ----------------------- */
productRoute.delete(
    '/sku/:skuId',
    authorization('updateOwn', Resources.PRODUCT),
    validateParamsId('skuId'),
    catchError(productController.deleteSKU)
);

export default productRoute; 