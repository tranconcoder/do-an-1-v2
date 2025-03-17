"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkout_controller_1 = __importDefault(require("../../controllers/checkout.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = __importDefault(require("../../middlewares/joiValidate.middleware"));
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const checkout_joi_1 = require("../../validations/joi/checkout.joi");
const getRoute = (0, express_1.Router)();
const getRouteValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(jwt_middleware_1.authenticate);
getRouteValidated.get('/checkout', (0, joiValidate_middleware_1.default)(checkout_joi_1.checkout), (0, catchError_middleware_1.default)(checkout_controller_1.default.checkout));
exports.default = getRoute;
