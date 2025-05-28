import { Router } from 'express';
import AddressController from '@/controllers/address.controller.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';

const route = Router();

/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
route.use(authenticate);

/* ---------------------------------------------------------- */
/*                       Delete Address                      */
/* ---------------------------------------------------------- */
route.delete(
    '/:addressId',
    catchError(AddressController.deleteAddress)
);

export default route; 