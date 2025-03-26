"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var get_route_js_1 = require("./get.route.js");
var route = (0, express_1.Router)();
/* -------------------------- GET  -------------------------- */
route.use(get_route_js_1.default);
exports.default = route;
