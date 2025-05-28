import { Router } from 'express';
import AddressController from '@/controllers/address.controller.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateUpdateAddress } from '@/validations/zod/address.zod.js';

const route = Router();

/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
route.use(authenticate);

/* ---------------------------------------------------------- */
/*                       Update Address                      */
/* ---------------------------------------------------------- */
route.patch(
    '/:addressId',
    validateUpdateAddress,
    catchError(AddressController.updateAddress)
);

/* ---------------------------------------------------------- */
/*                      Set Default Address                  */
/* ---------------------------------------------------------- */
route.patch(
    '/:addressId/default',
    catchError(AddressController.setDefaultAddress)
);

export default route; 