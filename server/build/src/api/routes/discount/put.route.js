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
const putRoute = (0, express_1.Router)();
/* ------------ Apply authenticate to all route  ------------ */
putRoute.use(jwt_middleware_1.authenticate);
putRoute.put('/', (0, joiValidate_middleware_1.default)(discount_joi_1.updateDiscountSchema), (0, catchError_middleware_1.default)(discount_controller_1.default.updateDiscount));
exports.default = putRoute;
