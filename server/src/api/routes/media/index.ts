import mediaController from '@/controllers/media.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateRequestParams } from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { getMediaFile } from '@/validations/zod/media.joi.js';
import { Router } from 'express';

const mediaRoute = Router();
const mediaRouteValidated = Router();

mediaRoute.get(
    '/:id',
    validateRequestParams(getMediaFile),
    catchError(mediaController.getMediaFile)
);
/* ---------------------------------------------------------- */
/*                         Validated                          */
/* ---------------------------------------------------------- */
/* mediaRoute.use(mediaRouteValidated);
mediaRouteValidated.use(authenticate); */

export default mediaRoute;
