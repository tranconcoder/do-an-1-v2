"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const delete_route_1 = __importDefault(require("./delete.route"));
const get_route_1 = __importDefault(require("./get.route"));
const post_route_1 = __importDefault(require("./post.route"));
const put_route_1 = __importDefault(require("./put.route"));
const discountRoute = (0, express_1.Router)();
/* -------------------------- GET  -------------------------- */
discountRoute.use(get_route_1.default);
/* -------------------------- POST -------------------------- */
discountRoute.use(post_route_1.default);
/* -------------------------- PUT  -------------------------- */
discountRoute.use(put_route_1.default);
/* ------------------------- DELETE ------------------------- */
discountRoute.use(delete_route_1.default);
exports.default = discountRoute;
