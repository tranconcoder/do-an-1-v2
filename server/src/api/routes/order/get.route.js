"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
/* ----------------------- Controller ----------------------- */
var checkout_controller_js_1 = require("@/controllers/checkout.controller.js");
/* -------------------------- Joi  -------------------------- */
var order_joi_js_1 = require("@/validations/joi/order.joi.js");
var checkout_joi_js_1 = require("@/validations/joi/checkout.joi.js");
/* ----------------------- Middleware ----------------------- */
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var order_controller_js_1 = require("@/controllers/order.controller.js");
var getRoute = (0, express_1.Router)();
var getRouteValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(jwt_middleware_js_1.authenticate);
getRouteValidated.get('/checkout', (0, joiValidate_middleware_js_1.default)(checkout_joi_js_1.checkout), (0, catchError_middleware_js_1.default)(checkout_controller_js_1.default.checkout));
getRouteValidated.get('/create', (0, joiValidate_middleware_js_1.default)(order_joi_js_1.createOrder), (0, catchError_middleware_js_1.default)(order_controller_js_1.default.createOrder));
exports.default = getRoute;
