import {
    generateValidateWithParams,
    generateValidateWithQuery
} from '@/middlewares/zod.middleware';
import z from 'zod';

export const mongooseId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const discountCode = z
    .string()
    .min(6, { message: 'Discount code must be at least 6 characters' })
    .max(10, { message: 'Discount code must be at most 10 characters' });

export const passwordType = z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });

export const phoneNumber = z
    .string()
    .regex(/(\+84|84|0[3|5|7|8|9])+([0-9]{8})\b/, { message: 'Invalid phone number format' });

export const pagination = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10)
});
export type Pagination = z.infer<typeof pagination>;
export const validatePagination = generateValidateWithQuery(pagination);

export const validateParamsId = (field: string, required = false) => {
    return generateValidateWithParams(
        z.object({
            [field]: required ? mongooseId : mongooseId.optional()
        })
    );
};
