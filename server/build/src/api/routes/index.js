"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Route child
const auth_1 = __importDefault(require("./auth"));
const product_1 = __importDefault(require("./product"));
const discount_1 = __importDefault(require("./discount"));
const cart_1 = __importDefault(require("./cart"));
const index_1 = __importDefault(require("./order/index"));
const rootRoute = (0, express_1.Router)();
rootRoute.use('/auth', auth_1.default);
rootRoute.use('/product', product_1.default);
rootRoute.use('/discount', discount_1.default);
rootRoute.use('/cart', cart_1.default);
rootRoute.use('/order', index_1.default);
exports.default = rootRoute;
