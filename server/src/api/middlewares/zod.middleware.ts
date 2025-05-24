import { BadRequestErrorResponse } from "@/response/error.response.js";
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