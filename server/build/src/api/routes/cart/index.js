"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const delete_route_1 = __importDefault(require("./delete.route"));
const get_route_1 = __importDefault(require("./get.route"));
const patch_route_1 = __importDefault(require("./patch.route"));
const post_route_1 = __importDefault(require("./post.route"));
const router = (0, express_1.Router)();
/* -------------------------- GET  -------------------------- */
router.use(get_route_1.default);
/* -------------------------- POST -------------------------- */
router.use(post_route_1.default);
/* ------------------------- DELETE ------------------------- */
router.use(delete_route_1.default);
/* ------------------------- PATCH  ------------------------- */
router.use(patch_route_1.default);
exports.default = router;
