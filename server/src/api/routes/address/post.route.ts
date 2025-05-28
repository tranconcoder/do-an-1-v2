import { Router } from 'express';
import AddressController from '@/controllers/address.controller.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateCreateAddress } from '@/validations/zod/address.zod.js';

const route = Router();

/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
route.use(authenticate);

/* ---------------------------------------------------------- */
/*                       Create Address                      */
/* ---------------------------------------------------------- */
route.post(
    '/',
    validateCreateAddress,
    catchError(AddressController.createAddress)
);

export default route; 