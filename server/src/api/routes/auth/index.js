"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
/* --------------------- Controllers -------------------- */
var auth_controller_js_1 = require("@/controllers/auth.controller.js");
/* ------------------------- Joi ------------------------ */
var auth_joi_js_1 = require("@/validations/joi/auth.joi.js");
/* --------------------- Middlewares -------------------- */
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var authRoute = (0, express_1.Router)();
var authRouteValidate = (0, express_1.Router)();
authRoute.post('/sign-up', (0, joiValidate_middleware_js_1.default)(auth_joi_js_1.signUpSchema), (0, catchError_middleware_js_1.default)(auth_controller_js_1.default.signUp));
// authRoute.post(
//     '/sign-up-shop',
//     joiValidate(signUpShopSchema),
//     catchError(AuthController.signUpShop)
// );
authRoute.post('/login', (0, joiValidate_middleware_js_1.default)(auth_joi_js_1.loginSchema), (0, catchError_middleware_js_1.default)(auth_controller_js_1.default.login));
authRoute.post('/new-token', (0, joiValidate_middleware_js_1.default)(auth_joi_js_1.newTokenSchema), (0, catchError_middleware_js_1.default)(auth_controller_js_1.default.newToken));
/* ------------------------------------------------------ */
/*                    Validate routes                     */
/* ------------------------------------------------------ */
authRoute.use(authRouteValidate);
authRouteValidate.use(jwt_middleware_js_1.authenticate);
authRouteValidate.post('/logout', (0, catchError_middleware_js_1.default)(auth_controller_js_1.default.logout));
exports.default = authRoute;
