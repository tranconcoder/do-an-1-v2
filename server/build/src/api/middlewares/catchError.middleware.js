"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = catchError;
function catchError(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        }
        catch (err) {
            next(err);
        }
    };
}
