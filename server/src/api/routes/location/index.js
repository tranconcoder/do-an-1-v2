"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var get_route_js_1 = require("./get.route.js");
var post_route_js_1 = require("./post.route.js");
var router = (0, express_1.Router)();
/* -------------------------- GET  -------------------------- */
router.use(get_route_js_1.default);
/* -------------------------- POST -------------------------- */
router.use(post_route_js_1.default);
exports.default = router;
