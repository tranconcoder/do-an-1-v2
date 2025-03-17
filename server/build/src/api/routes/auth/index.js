"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
/* --------------------- Controllers -------------------- */
const auth_controller_1 = __importDefault(require("../../controllers/auth.controller"));
/* ------------------------- Joi ------------------------ */
const auth_joi_1 = require("../../validations/joi/auth.joi");
/* --------------------- Middlewares -------------------- */
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = __importDefault(require("../../middlewares/joiValidate.middleware"));
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const authRoute = (0, express_1.Router)();
const authRouteValidate = (0, express_1.Router)();
authRoute.post('/sign-up', (0, joiValidate_middleware_1.default)(auth_joi_1.signUpSchema), (0, catchError_middleware_1.default)(auth_controller_1.default.signUp));
authRoute.post('/login', (0, joiValidate_middleware_1.default)(auth_joi_1.loginSchema), (0, catchError_middleware_1.default)(auth_controller_1.default.login));
authRoute.post('/new-token', (0, joiValidate_middleware_1.default)(auth_joi_1.newTokenSchema), (0, catchError_middleware_1.default)(auth_controller_1.default.newToken));
/* ------------------------------------------------------ */
/*                    Validate routes                     */
/* ------------------------------------------------------ */
authRoute.use(authRouteValidate);
authRouteValidate.use(jwt_middleware_1.authenticate);
authRouteValidate.post('/logout', (0, catchError_middleware_1.default)(auth_controller_1.default.logout));
exports.default = authRoute;
