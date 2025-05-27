import Joi from 'joi';
import { CartItemStatus } from '@/enums/cart.enum.js';
import { mongooseId } from '@/configs/joi.config.js';
import { z } from 'zod';
import {
    generateValidateWithBody,
    generateValidateWithParams
} from '@/middlewares/zod.middleware.js';
import { zodId } from './index.js';

/* ---------------------- Add to cart  ---------------------- */
export const addToCartSchema = z.object({
    skuId: z.string().min(1),
    quantity: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
            message: 'Quantity must be a number'
        })
});
export type AddToCart = z.infer<typeof addToCartSchema>;
export const validateAddToCart = generateValidateWithParams(addToCartSchema);

/* ---------------------- Update cart  ---------------------- */
export const updateCart = z.object({
    cartShop: z
        .array(
            z.object({
                shopId: zodId,
                products: z
                    .array(
                        z.object({
                            id: zodId,

                            // Quantity
                            newQuantity: z.number().min(0),

                            // Status
                            newStatus: z.nativeEnum(CartItemStatus).optional(),

                            // Delete
                            isDelete: z.boolean().optional()
                        })
                    )
                    .min(1)
            })
        )
        .min(1)
});

export type UpdateCart = z.infer<typeof updateCart>;
export const validateUpdateCart = generateValidateWithBody(updateCart);
