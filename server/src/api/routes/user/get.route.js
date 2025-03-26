"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var user_controller_js_1 = require("@/controllers/user.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var express_1 = require("express");
var getRoute = (0, express_1.Router)();
var getRouteValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(jwt_middleware_js_1.authenticate);
getRouteValidated.get('/profile', (0, catchError_middleware_js_1.default)(user_controller_js_1.default.getProfile));
exports.default = getRoute;
