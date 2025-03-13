import { Schema } from 'joi';
import catchError from './catchError.middleware';

/* --------------- Validate request body  --------------- */
export default function validateRequestBody(schema: Schema) {
    return catchError(async (req, _, next) => {
        await schema.validateAsync(req.body);
        next();
    });
}

/* -------------- Validate request params  -------------- */
export const validateRequestParams = (schema: Schema) => {
    return catchError(async (req, _, next) => {
        await schema.validateAsync(req.params);
        next();
    });
};

/* --------------- Validate product query --------------- */
export const validateRequestQuery= (schema: Schema) => {
    return catchError(async (req, _, next) => {
        await schema.validateAsync(req.query);
        next();
    });
};
