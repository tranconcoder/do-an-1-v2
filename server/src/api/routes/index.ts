import { Router } from 'express';

// Route child
import authRoute from './auth/index.js';
import spuRoute from './spu/index.js';
import discountRoute from './discount/index.js';
import cartRoute from './cart/index.js';
import orderRoute from './order/index.js';
import userRoute from './user/index.js';
import locationRoute from './location/index.js';
import mediaRoute from './media/index.js';
import shopRoute from './shop/index.js';
import categoryRoute from './category/index.js';
import warehousesRouter from './wareshouses/index.js';

const rootRoute = Router();

rootRoute.use('/auth', authRoute);

/* ------------------------ Discount  ----------------------- */
rootRoute.use('/discount', discountRoute);

/* -------------------------- Cart  -------------------------- */
rootRoute.use('/cart', cartRoute);

/* ------------------------- Order ------------------------- */
rootRoute.use('/order', orderRoute);

/* -------------------------- User -------------------------- */
rootRoute.use('/user', userRoute);

/* ----------------------- Location  ----------------------- */
rootRoute.use('/location', locationRoute);

rootRoute.use('/media', mediaRoute);

/* -------------------------- Shop -------------------------- */
rootRoute.use('/shop', shopRoute);

rootRoute.use('/category', categoryRoute);

/* -------------------------- SPU  -------------------------- */
rootRoute.use('/spu', spuRoute);

/* ------------------------ Warehouse ------------------------ */
rootRoute.use('/warehouses', warehousesRouter);

export default rootRoute;
