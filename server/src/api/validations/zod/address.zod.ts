import { z } from 'zod';
import { generateValidateWithBody } from '@/middlewares/zod.middleware.js';

/* ---------------------------------------------------------- */
/*                       Create Address                      */
/* ---------------------------------------------------------- */
export const CreateAddressSchema = z.object({
    recipient_name: z
        .string()
        .min(1, 'Recipient name is required')
        .max(100, 'Recipient name must be less than 100 characters'),
    
    recipient_phone: z
        .string()
        .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    
    location: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid location ID'),
    
    address_label: z
        .string()
        .max(50, 'Address label must be less than 50 characters')
        .optional(),
    
    is_default: z
        .boolean()
        .optional()
});

export type CreateAddressSchema = z.infer<typeof CreateAddressSchema>;
export const validateCreateAddress = generateValidateWithBody(CreateAddressSchema);

/* ---------------------------------------------------------- */
/*                       Update Address                      */
/* ---------------------------------------------------------- */
export const UpdateAddressSchema = z.object({
    recipient_name: z
        .string()
        .min(1, 'Recipient name is required')
        .max(100, 'Recipient name must be less than 100 characters')
        .optional(),
    
    recipient_phone: z
        .string()
        .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
        .optional(),
    
    location: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid location ID')
        .optional(),
    
    address_label: z
        .string()
        .max(50, 'Address label must be less than 50 characters')
        .optional(),
    
    is_default: z
        .boolean()
        .optional()
});

export type UpdateAddressSchema = z.infer<typeof UpdateAddressSchema>;
export const validateUpdateAddress = generateValidateWithBody(UpdateAddressSchema);

/* ---------------------------------------------------------- */
/*                      Set Default Address                  */
/* ---------------------------------------------------------- */
export const SetDefaultAddressSchema = z.object({
    addressId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid address ID')
});

export type SetDefaultAddressSchema = z.infer<typeof SetDefaultAddressSchema>; 