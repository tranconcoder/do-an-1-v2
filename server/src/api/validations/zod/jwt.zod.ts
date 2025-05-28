import z from 'zod';
import _ from 'lodash';
import { zodId } from './index.js'; // Changed from Joi's mongooseId
import { generateValidateWithBody } from '../../middlewares/zod.middleware.js';

/* ------------------------------------------------------ */
/*                  Token payload schema                  */
/* ------------------------------------------------------ */
const jwtPayload = z
    .object({
        id: zodId, // Changed from mongooseId
        role: z.string().min(1).max(50),
        exp: z.number().int(),
        iat: z.number().int()
    })
    .strict();

export const jwtPayloadSignSchema = jwtPayload.pick({
    id: true,
    role: true
});
export type JwtPayloadSignSchema = z.infer<typeof jwtPayloadSignSchema>;
export const validateJwtPayloadSign = generateValidateWithBody(jwtPayloadSignSchema);

export const jwtDecodeSchema = z.object({
    id: jwtPayload.shape.id,
    role: jwtPayload.shape.role,
    exp: jwtPayload.shape.exp,
    iat: jwtPayload.shape.iat
});
export type JwtDecodeSchema = z.infer<typeof jwtDecodeSchema>;
export const validateJwtDecode = generateValidateWithBody(jwtDecodeSchema);
