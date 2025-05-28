import z from 'zod';
import { zodId } from '../zod';
import { generateValidateWithBody } from '@/middlewares/zod.middleware';

// export const createLocation = Joi.object<joi.location.CreateLocation>({
//     provinceId: mongooseId,
//     districtId: mongooseId,
//     wardId: mongooseId,
//     address: Joi.string().required(),
//     coordinates: Joi.object({
//         x: Joi.number().required(),
//         y: Joi.number().required()
//     }).required(),
// });

export const createLocation = z.object({
    provinceId: zodId.min(1, 'Province ID is required'),
    districtId: zodId.min(1, 'District ID is required'),
    wardId: zodId.optional(),
    address: z.string().min(1, 'Address is required'),
    coordinates: z
        .object({
            x: z
                .number()
                .min(-180, 'X coordinate must be between -180 and 180')
                .max(180, 'X coordinate must be between -180 and 180'),
            y: z
                .number()
                .min(-90, 'Y coordinate must be between -90 and 90')
                .max(90, 'Y coordinate must be between -90 and 90')
        })
        .required()
});

export type CreateLocation = z.infer<typeof createLocation>;

export const validateCreateLocation = generateValidateWithBody(createLocation);
