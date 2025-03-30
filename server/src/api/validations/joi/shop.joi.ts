import { mongooseId } from '@/configs/joi.config.js';
import Joi from 'joi';

export const approveShop = Joi.object<joiTypes.shop.ApproveShop>({
    shopId: mongooseId
});

export const rejectShop = Joi.object<joiTypes.shop.RejectShop>({
    shopId: mongooseId
});
