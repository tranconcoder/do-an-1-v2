import { Schema } from 'joi';
import catchError from './catchError.middleware.js';

/* --------------- Validate request body  --------------- */
export default function validateRequestBody(schema: Schema) {
    return catchError(async (req, _, next) => {
        req.body = await schema.validateAsync(req.body, { convert: true }); // Convert string number ===> number
        next();
    });
}

/* -------------- Validate request params  -------------- */
export const validateRequestParams = (schema: Schema) => {
    return catchError(async (req, _, next) => {
        req.params = await schema.validateAsync(req.params, { convert: true });
        next();
    });
};

/* --------------- Validate product query --------------- */
export const validateRequestQuery = (schema: Schema) => {
    return catchError(async (req, _, next) => {
        req.query = await schema.validateAsync(req.query, { convert: true });
        next();
    });
};
