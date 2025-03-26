"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
/* --------------------- Controller --------------------- */
/* --------------------- Middleware --------------------- */
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
/* ------------------------- Joi ------------------------ */
/* ----------------------- Routes ----------------------- */
var get_route_js_1 = require("./get.route.js");
var patch_route_js_1 = require("./patch.route.js");
var put_route_js_1 = require("./put.route.js");
var delete_route_js_1 = require("./delete.route.js");
var post_route_js_1 = require("./post.route.js");
var productRoute = (0, express_1.Router)();
var productRouteValidate = (0, express_1.Router)();
/* ------------------------ GET  ------------------------ */
productRoute.use(get_route_js_1.default);
/* ====================================================== */
/*                  AUTHENTICATE ROUTES                   */
/* ====================================================== */
productRoute.use(productRouteValidate);
productRouteValidate.use(jwt_middleware_js_1.authenticate);
/* ------------------------ POST ------------------------ */
productRouteValidate.use(post_route_js_1.default);
/* ----------------------- PATCH  ----------------------- */
productRouteValidate.use(patch_route_js_1.default);
/* ------------------------ PUT  ------------------------ */
productRouteValidate.use(put_route_js_1.default);
/* ----------------------- DELETE ----------------------- */
productRouteValidate.use(delete_route_js_1.default);
exports.default = productRoute;
