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

// Middleware to parse JSON fields from FormData
export const parseJSONFields = (jsonFields: string[]): RequestHandler => {
    return (req, res, next) => {
        try {
            for (const field of jsonFields) {
                if (req.body[field] && typeof req.body[field] === 'string') {
                    try {
                        req.body[field] = JSON.parse(req.body[field]);
                    } catch (error) {
                        console.warn(`Failed to parse JSON field '${field}':`, req.body[field]);
                        // If parsing fails, leave as is (might be validation will catch it)
                    }
                }
            }
            next();
        } catch (error) {
            next(error);
        }
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

        req.query = result.data;
        next();
    };
};
