"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discount_controller_1 = __importDefault(require("../../controllers/discount.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = __importDefault(require("../../middlewares/joiValidate.middleware"));
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const discount_joi_1 = require("../../validations/joi/discount.joi");
const discountPostRoute = (0, express_1.Router)();
const discountPostRouteValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
discountPostRoute.use(discountPostRouteValidated);
discountPostRouteValidated.use(jwt_middleware_1.authenticate);
/* -------------------- Create discount  -------------------- */
discountPostRouteValidated.post('/create', (0, joiValidate_middleware_1.default)(discount_joi_1.createDiscountSchema), (0, catchError_middleware_1.default)(discount_controller_1.default.createDiscount));
exports.default = discountPostRoute;
