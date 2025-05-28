import { phoneNumber } from '@/configs/joi.config.js';
import { createLocation } from '../zod/location.zod.js';
import z from 'zod';
import { generateValidateWithBody } from '@/middlewares/zod.middleware.js';

export const createWarehouse = z
    .object({
        name: z.string().min(1, { message: 'Name is required' }),
        phoneNumber: phoneNumber,
        location: createLocation
    })
    .strict();

export type CreateWarehouse = z.infer<typeof createWarehouse>;

export const validateCreateWarehouse = generateValidateWithBody(createWarehouse);
