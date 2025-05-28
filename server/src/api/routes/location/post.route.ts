import locationController from '@/controllers/location.controller.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateCreateLocation } from '@/validations/zod/location.zod.js';
import { Router } from 'express';
import catchError from '@/middlewares/catchError.middleware.js';

const router = Router();
const routerValidated = Router();

/* ---------------------------------------------------------- */
/*                         Validated                          */
/* ---------------------------------------------------------- */
router.use(routerValidated);
routerValidated.use(authenticate);

/* ------------------ Create new location  ------------------ */
router.post(
    '/',
    validateCreateLocation,
    catchError(locationController.createLocation)
);

export default router;
