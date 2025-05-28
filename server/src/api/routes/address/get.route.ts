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
/*                      Get User Addresses                   */
/* ---------------------------------------------------------- */
route.get('/', catchError(AddressController.getUserAddresses));

/* ---------------------------------------------------------- */
/*                     Get Default Address                   */
/* ---------------------------------------------------------- */
route.get('/default', catchError(AddressController.getDefaultAddress));

export default route; 