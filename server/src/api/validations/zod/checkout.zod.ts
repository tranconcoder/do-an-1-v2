import { z } from 'zod';
import { zodId } from './index';
import { generateValidateWithBody, generateValidateWithQuery } from '@/middlewares/zod.middleware.js';

// Define discountCode schema if not already defined in index.ts
const zodDiscountCode = z.string().max(50);

// Individual shop discount schema
const shopDiscountSchema = z.object({
    discountCode: zodDiscountCode,
    shopId: zodId
});

// Main checkout schema
export const checkoutSchema = z.object({
    discountCode: zodDiscountCode.optional(),
    shopsDiscount: z.array(shopDiscountSchema),
    addressId: zodId
});

// Export types
export type ShopDiscountSchema = z.infer<typeof shopDiscountSchema>;
export type CheckoutSchema = z.infer<typeof checkoutSchema>;

// Export validation middleware
export const validateCheckout = generateValidateWithBody(checkoutSchema);
