import { Router } from 'express';
import ProductController from '@/controllers/spu.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { Resources } from '@/enums/rbac.enum.js';
import spuController from '@/controllers/spu.controller.js';
import { createSPU } from '@/validations/joi/spu.joi.js';
import { uploadFieldsMedia, uploadSingleMedia } from '@/middlewares/media.middleware.js';
import { AvatarFields } from '@/enums/media.enum.js';
import { uploadAvatar, uploadSPU } from '@/middlewares/multer.middleware.js';
import { SPUImages } from '@/enums/spu.enum.js';

const spuPostRoute = Router();

/* --------------------- Create product --------------------- */
spuPostRoute.post(
    '/create',

    /* --------------------- Update thumnail -------------------- */
    uploadSingleMedia(SPUImages.PRODUCT_THUMB, uploadSPU, 'Product thumbnail'),

    /* ---------------------- Upload images --------------------- */
    // uploadFieldsMedia({}),

    authorization('createOwn', Resources.PRODUCT),
    validateRequestBody(createSPU),
    catchError(spuController.createSPU)
);

export default spuPostRoute;
