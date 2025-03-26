"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var discount_controller_js_1 = require("@/controllers/discount.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var discount_joi_js_1 = require("@/validations/joi/discount.joi.js");
var discountPostRoute = (0, express_1.Router)();
var discountPostRouteValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
discountPostRoute.use(discountPostRouteValidated);
discountPostRouteValidated.use(jwt_middleware_js_1.authenticate);
/* -------------------- Create discount  -------------------- */
discountPostRouteValidated.post('/create', (0, joiValidate_middleware_js_1.default)(discount_joi_js_1.createDiscountSchema), (0, catchError_middleware_js_1.default)(discount_controller_js_1.default.createDiscount));
exports.default = discountPostRoute;
