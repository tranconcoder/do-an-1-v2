import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import ErrorResponse from '@/response/error.response.js';
import loggerService from './logger.service.js';
import { v7 as uuid } from 'uuid';
import { NODE_ENV } from '@/../configs/server.config.js';

type ErrorHandler = (error: ErrorResponse, req: Request, res: Response, next: NextFunction) => void;

export default class HandleErrorService {
    public static middleware: ErrorRequestHandler = (err, req, res, next) => {
        let errorResponse: ErrorResponse = err;

        // Convert error to ErrorResponse if it's not already
        if (err instanceof Error) {
            console.log(err.stack)
            errorResponse = new ErrorResponse({
                statusCode: 400,
                name: err.name,
                message: err.message,
                routePath: req.originalUrl
            });
        } else if (!(err instanceof ErrorResponse)) {
            errorResponse = new ErrorResponse({
                statusCode: 500,
                name: 'InternalServerError',
                message: 'Internal server error',
                routePath: req.originalUrl
            });
        }

        // Handle return response
        this[NODE_ENV](errorResponse, req, res, next);
    };

    private static development: ErrorHandler = (error, _, res, next) => {
        // Log error
        loggerService.getInstance().error(error.toString());

        // Send error response
        res.status(error.statusCode).json(error.get());
    };

    private static production: ErrorHandler = (error, _, res, next) => {
        // Generate error
        const logId = uuid();
        const { hideOnProduction } = error;

        // Log error
        loggerService.getInstance().error(error.toString(), { id: logId });

        // Send error response
        if (hideOnProduction) {
            res.status(error.statusCode).json({
                code: logId,
                statusCode: error.statusCode,
                message: 'Oops.... Something went wrong. Please try again later.'
            });
        } else {
            res.status(error.statusCode).json(error.get());
        }
    };
}
