import { BadRequestErrorResponse } from "@/response/error.response.js";
import { zodId } from "@/validations/zod/index.js";
import { RequestHandler } from "express";
import { z } from "zod";

export const generateValidateWithBody = (schema: z.ZodSchema): RequestHandler => {
    return (req, res, next) => {
        const { error } = schema.safeParse(req.body);
        if (error) {
            throw new BadRequestErrorResponse({
                message: error.message,
            });
        }

        next();
    }
}

export const generateValidateWithParams = (schema: z.ZodSchema): RequestHandler => {
    return (req, res, next) => {
        const { error } = schema.safeParse(req.params);
        if (error) {
            throw new BadRequestErrorResponse({
                message: error.message,
            });
        }

        next();
    }
}
export const generateValidateWithParamsId = (id: string): RequestHandler => {
    return (req, res, next) => {
        const { error } = zodId.safeParse(req.params[id]);
        if (error) {
            throw new BadRequestErrorResponse({
                message: error.message,
            });
        }

        next();
    }
}