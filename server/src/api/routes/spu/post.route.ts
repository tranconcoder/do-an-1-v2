import { Router } from 'express';
import ProductController from '@/controllers/spu.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { createProductSchema } from '@/validations/joi/product/index.joi.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { Resources } from '@/enums/rbac.enum.js';
import spuController from '@/controllers/spu.controller.js';

const spuPostRoute = Router();

/* --------------------- Create product --------------------- */
spuPostRoute.post(
    '/create',
    authorization('createOwn', Resources.PRODUCT),
    validateRequestBody(createProductSchema),
    catchError(spuController.createSPU)
);

export default spuPostRoute;
