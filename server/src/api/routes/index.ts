import { Router } from 'express';

// Route child
import authRoute from './auth/index.js';
import productRoute from './product/index.js';
import discountRoute from './discount/index.js';
import cartRoute from './cart/index.js';
import orderRoute from './order/index.js';
import userRoute from './user/index.js';

const rootRoute = Router();

rootRoute.use('/auth', authRoute);
rootRoute.use('/product', productRoute);
rootRoute.use('/discount', discountRoute);
rootRoute.use('/cart', cartRoute);
rootRoute.use('/order', orderRoute);
rootRoute.use('/user', userRoute);

export default rootRoute;
