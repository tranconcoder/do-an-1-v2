import { z } from 'zod';
import { zodId } from './index';
import { generateValidateWithBody } from '../../middlewares/zod.middleware.js';

export const approveShopSchema = z.object({
    shopId: zodId
});

export type ApproveShopSchema = z.infer<typeof approveShopSchema>;
export const validateApproveShop = generateValidateWithBody(approveShopSchema);

export const rejectShopSchema = z.object({
    shopId: zodId
});

export type RejectShopSchema = z.infer<typeof rejectShopSchema>;
export const validateRejectShop = generateValidateWithBody(rejectShopSchema);
