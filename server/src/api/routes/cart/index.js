"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var delete_route_js_1 = require("./delete.route.js");
var get_route_js_1 = require("./get.route.js");
var patch_route_js_1 = require("./patch.route.js");
var post_route_js_1 = require("./post.route.js");
var router = (0, express_1.Router)();
/* -------------------------- GET  -------------------------- */
router.use(get_route_js_1.default);
/* -------------------------- POST -------------------------- */
router.use(post_route_js_1.default);
/* ------------------------- DELETE ------------------------- */
router.use(delete_route_js_1.default);
/* ------------------------- PATCH  ------------------------- */
router.use(patch_route_js_1.default);
exports.default = router;
