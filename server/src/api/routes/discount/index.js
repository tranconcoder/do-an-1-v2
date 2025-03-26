"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var delete_route_js_1 = require("./delete.route.js");
var get_route_js_1 = require("./get.route.js");
var post_route_js_1 = require("./post.route.js");
var put_route_js_1 = require("./put.route.js");
var discountRoute = (0, express_1.Router)();
/* -------------------------- GET  -------------------------- */
discountRoute.use(get_route_js_1.default);
/* -------------------------- POST -------------------------- */
discountRoute.use(post_route_js_1.default);
/* -------------------------- PUT  -------------------------- */
discountRoute.use(put_route_js_1.default);
/* ------------------------- DELETE ------------------------- */
discountRoute.use(delete_route_js_1.default);
exports.default = discountRoute;
