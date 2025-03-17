"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
/* --------------------- Controller --------------------- */
/* --------------------- Middleware --------------------- */
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
/* ------------------------- Joi ------------------------ */
/* ----------------------- Routes ----------------------- */
const get_route_1 = __importDefault(require("./get.route"));
const patch_route_1 = __importDefault(require("./patch.route"));
const put_route_1 = __importDefault(require("./put.route"));
const delete_route_1 = __importDefault(require("./delete.route"));
const post_route_1 = __importDefault(require("./post.route"));
const productRoute = (0, express_1.Router)();
const productRouteValidate = (0, express_1.Router)();
/* ------------------------ GET  ------------------------ */
productRoute.use(get_route_1.default);
/* ====================================================== */
/*                  AUTHENTICATE ROUTES                   */
/* ====================================================== */
productRoute.use(productRouteValidate);
productRouteValidate.use(jwt_middleware_1.authenticate);
/* ------------------------ POST ------------------------ */
productRouteValidate.use(post_route_1.default);
/* ----------------------- PATCH  ----------------------- */
productRouteValidate.use(patch_route_1.default);
/* ------------------------ PUT  ------------------------ */
productRouteValidate.use(put_route_1.default);
/* ----------------------- DELETE ----------------------- */
productRouteValidate.use(delete_route_1.default);
exports.default = productRoute;
