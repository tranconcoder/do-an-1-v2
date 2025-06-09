import { z } from 'zod';
import { zodId } from './index.js';
import {
    generateValidateWithBody,
    generateValidateWithParams
} from '@/middlewares/zod.middleware.js';

/* ---------------------------------------------------------- */
/*                    Location Schema                         */
/* ---------------------------------------------------------- */
export const warehouseLocationSchema = z.object({
    provinceId: zodId,
    districtId: zodId,
    wardId: zodId.optional(),
    address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters')
});

export type WarehouseLocationSchema = z.infer<typeof warehouseLocationSchema>;

/* ---------------------------------------------------------- */
/*                    Create Warehouse                        */
/* ---------------------------------------------------------- */
export const createWarehouseSchema = z.object({
    name: z.string().min(1, 'Warehouse name is required').max(100, 'Warehouse name must be less than 100 characters'),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    location: warehouseLocationSchema
});

export type CreateWarehouseSchema = z.infer<typeof createWarehouseSchema>;
export const validateCreateWarehouse = generateValidateWithBody(createWarehouseSchema);

/* ---------------------------------------------------------- */
/*                    Update Warehouse                        */
/* ---------------------------------------------------------- */
export const updateWarehouseSchema = z.object({
    name: z.string().min(1, 'Warehouse name is required').max(100, 'Warehouse name must be less than 100 characters').optional(),
    phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits').optional(),
    location: z.object({
        provinceId: zodId,
        districtId: zodId,
        wardId: zodId.optional(),
        address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters')
    }).optional()
}).refine((data) => {
    // If location is provided, ensure all required fields are present
    if (data.location) {
        return data.location.provinceId && data.location.districtId && data.location.address;
    }
    return true;
}, {
    message: 'If location is provided, provinceId, districtId, and address are required',
    path: ['location']
});

export type UpdateWarehouseSchema = z.infer<typeof updateWarehouseSchema>;
export const validateUpdateWarehouse = generateValidateWithBody(updateWarehouseSchema);

/* ---------------------------------------------------------- */
/*                   Warehouse Params                         */
/* ---------------------------------------------------------- */
export const warehouseParamsSchema = z.object({
    warehouseId: zodId
});

export type WarehouseParamsSchema = z.infer<typeof warehouseParamsSchema>;
export const validateWarehouseParams = generateValidateWithParams(warehouseParamsSchema); 