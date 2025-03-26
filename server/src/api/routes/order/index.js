"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var get_route_js_1 = require("./get.route.js");
var orderRoute = (0, express_1.Router)();
/* -------------------------- GET  -------------------------- */
orderRoute.use(get_route_js_1.default);
exports.default = orderRoute;
