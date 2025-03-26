"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cart_controller_js_1 = require("@/controllers/cart.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var cart_joi_js_1 = require("@/validations/joi/cart.joi.js");
var deleteRouter = (0, express_1.Router)();
var deleteRouterValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Route validated                       */
/* ---------------------------------------------------------- */
deleteRouter.use(deleteRouterValidated);
deleteRouterValidated.use(jwt_middleware_js_1.authenticate);
deleteRouterValidated.delete('/product/:productId', (0, joiValidate_middleware_js_1.validateRequestParams)(cart_joi_js_1.deleteProductFromCart), (0, catchError_middleware_js_1.default)(cart_controller_js_1.default.deleteProductFromCart));
exports.default = deleteRouter;
