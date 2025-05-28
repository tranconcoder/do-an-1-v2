import { BadRequestErrorResponse } from '@/response/error.response.js';
import { zodId } from '@/validations/zod/index.js';
import { RequestHandler } from 'express';
import { z } from 'zod';

export const generateValidateWithBody = (schema: z.ZodSchema): RequestHandler => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            throw new BadRequestErrorResponse({
                message: result.error.message
            });
        }

        next();
    };
};

export const generateValidateWithParams = (schema: z.ZodSchema): RequestHandler => {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            throw new BadRequestErrorResponse({
                message: result.error.message
            });
        }

        next();
    };
};
export const generateValidateWithParamsId = (id: string): RequestHandler => {
    return (req, res, next) => {
        const result = zodId.safeParse(req.params[id]);
        if (!result.success) {
            throw new BadRequestErrorResponse({
                message: result.error.message
            });
        }

        next();
    };
};

export const generateValidateWithQuery = (schema: z.ZodSchema): RequestHandler => {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            throw new BadRequestErrorResponse({
                message: result.error.message
            });
        }

        next();
    };
};
