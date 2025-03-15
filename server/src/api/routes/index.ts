import { Router } from 'express';

// Route child
import authRoute from './auth';
import productRoute from './product';
import discountRoute from './discount';
import cartRoute from "./cart"

const rootRoute = Router();

rootRoute.use('/auth', authRoute);
rootRoute.use('/product', productRoute);
rootRoute.use('/discount', discountRoute);
rootRoute.use("/cart", cartRoute)

export default rootRoute;
