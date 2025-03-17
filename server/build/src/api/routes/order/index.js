"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_route_1 = __importDefault(require("../cart/get.route"));
const orderRoute = (0, express_1.Router)();
/* -------------------------- GET  -------------------------- */
orderRoute.use(get_route_1.default);
exports.default = orderRoute;
