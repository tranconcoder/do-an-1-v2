"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = __importDefault(require("../../controllers/cart.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = require("../../middlewares/joiValidate.middleware");
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const cart_joi_1 = require("../../validations/joi/cart.joi");
const deleteRouter = (0, express_1.Router)();
const deleteRouterValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Route validated                       */
/* ---------------------------------------------------------- */
deleteRouter.use(deleteRouterValidated);
deleteRouterValidated.use(jwt_middleware_1.authenticate);
deleteRouterValidated.delete('/product/:productId', (0, joiValidate_middleware_1.validateRequestParams)(cart_joi_1.deleteProductFromCart), (0, catchError_middleware_1.default)(cart_controller_1.default.deleteProductFromCart));
exports.default = deleteRouter;
