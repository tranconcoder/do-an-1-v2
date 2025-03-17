import { Router } from 'express';

// Route child
import authRoute from './auth';
import productRoute from './product';
import discountRoute from './discount';
import cartRoute from './cart';
import orderRoute from './order/index';

const rootRoute = Router();

rootRoute.use('/auth', authRoute);
rootRoute.use('/product', productRoute);
rootRoute.use('/discount', discountRoute);
rootRoute.use('/cart', cartRoute);
rootRoute.use('/order', orderRoute);

export default rootRoute;
