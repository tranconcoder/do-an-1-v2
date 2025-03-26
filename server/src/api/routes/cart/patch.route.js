"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cart_controller_js_1 = require("@/controllers/cart.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var cart_joi_js_1 = require("@/validations/joi/cart.joi.js");
var patchRouter = (0, express_1.Router)();
var patchRouterValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
patchRouter.use(patchRouterValidated);
patchRouterValidated.use(jwt_middleware_js_1.authenticate);
patchRouterValidated.patch('/update', (0, joiValidate_middleware_js_1.default)(cart_joi_js_1.updateCart), (0, catchError_middleware_js_1.default)(cart_controller_js_1.default.updateCart));
exports.default = patchRouter;
