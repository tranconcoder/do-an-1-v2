"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discount_controller_1 = __importDefault(require("../../controllers/discount.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = require("../../middlewares/joiValidate.middleware");
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const discount_joi_1 = require("../../validations/joi/discount.joi");
const deleteRouter = (0, express_1.Router)();
deleteRouter.use(jwt_middleware_1.authenticate);
/* -------------------- Delete discount  -------------------- */
deleteRouter.delete('/:discountId', (0, joiValidate_middleware_1.validateRequestParams)(discount_joi_1.deleteDiscountSchema), (0, catchError_middleware_1.default)(discount_controller_1.default.deleteDiscount));
exports.default = deleteRouter;
