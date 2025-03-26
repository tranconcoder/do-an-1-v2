"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cart_controller_js_1 = require("@/controllers/cart.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var getRouter = (0, express_1.Router)();
var getRouterValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
getRouter.use(getRouterValidated);
getRouterValidated.use(jwt_middleware_js_1.authenticate);
getRouterValidated.get('/', (0, catchError_middleware_js_1.default)(cart_controller_js_1.default.getCart));
exports.default = getRouter;
