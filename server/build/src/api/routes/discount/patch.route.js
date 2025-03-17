"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joiValidate_middleware_1 = __importDefault(require("../../middlewares/joiValidate.middleware"));
const discount_joi_1 = require("../../validations/joi/discount.joi");
const patchRoute = (0, express_1.Router)();
const patchRouteValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
/* ----------------- Set available discount ----------------- */
patchRouteValidated.patch('/set-available', (0, joiValidate_middleware_1.default)(discount_joi_1.setAvailableDiscountSchema));
/* ---------------- Set unavailable discount ---------------- */
patchRouteValidated.patch('/set-unavailable', (0, joiValidate_middleware_1.default)(discount_joi_1.setUnavailableDiscountSchema));
exports.default = patchRoute;
