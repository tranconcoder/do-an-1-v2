"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = __importDefault(require("../../controllers/cart.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const getRouter = (0, express_1.Router)();
const getRouterValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
getRouter.use(getRouterValidated);
getRouterValidated.use(jwt_middleware_1.authenticate);
getRouterValidated.get('/', (0, catchError_middleware_1.default)(cart_controller_1.default.getCart));
exports.default = getRouter;
