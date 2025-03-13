import type { RequestHandler } from 'express';

export default function catchError(
    cb: RequestHandler<any, any, any>
): RequestHandler {
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}
