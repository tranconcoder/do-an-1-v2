"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var discount_controller_js_1 = require("@/controllers/discount.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var discount_joi_js_1 = require("@/validations/joi/discount.joi.js");
var putRoute = (0, express_1.Router)();
/* ------------ Apply authenticate to all route  ------------ */
putRoute.use(jwt_middleware_js_1.authenticate);
putRoute.put('/', (0, joiValidate_middleware_js_1.default)(discount_joi_js_1.updateDiscountSchema), (0, catchError_middleware_js_1.default)(discount_controller_js_1.default.updateDiscount));
exports.default = putRoute;
