"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = __importDefault(require("../../controllers/cart.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = __importDefault(require("../../middlewares/joiValidate.middleware"));
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const cart_joi_1 = require("../../validations/joi/cart.joi");
const patchRouter = (0, express_1.Router)();
const patchRouterValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
patchRouter.use(patchRouterValidated);
patchRouterValidated.use(jwt_middleware_1.authenticate);
patchRouterValidated.patch('/update', (0, joiValidate_middleware_1.default)(cart_joi_1.updateCart), (0, catchError_middleware_1.default)(cart_controller_1.default.updateCart));
exports.default = patchRouter;
