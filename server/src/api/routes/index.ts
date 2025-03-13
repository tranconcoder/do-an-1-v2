import { Router } from 'express';

// Route child
import authRoute from './auth';
import productRoute from './product';
import discountRoute from './discount/index';

const rootRoute = Router();

rootRoute.use('/auth', authRoute);
rootRoute.use('/product', productRoute);
rootRoute.use('/discount', discountRoute);

export default rootRoute;
