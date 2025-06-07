import { Router } from 'express';
import DiscountController from '@/controllers/discount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateUpdateDiscount } from '@/validations/zod/discount.zod';

const putRoute = Router();

/* ------------ Apply authenticate to all route  ------------ */
putRoute.use(authenticate);

putRoute.put('/', validateUpdateDiscount, catchError(DiscountController.updateDiscount));

export default putRoute;
