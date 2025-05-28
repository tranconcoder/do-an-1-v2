import mediaController from '@/controllers/media.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { generateValidateWithParamsId } from '@/middlewares/zod.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { Router } from 'express';

const mediaRoute = Router();
const mediaRouteValidated = Router();

mediaRoute.get(
    '/:id',
    generateValidateWithParamsId('id'),
    catchError(mediaController.getMediaFile)
);
/* ---------------------------------------------------------- */
/*                         Validated                          */
/* ---------------------------------------------------------- */
/* mediaRoute.use(mediaRouteValidated);
mediaRouteValidated.use(authenticate); */

export default mediaRoute;
