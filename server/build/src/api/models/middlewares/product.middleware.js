"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSlug = void 0;
const slugify_1 = __importDefault(require("slugify"));
const addSlug = function (next) {
    this.product_slug = (0, slugify_1.default)(this.product_name, {
        lower: true,
        trim: true,
        locale: 'vi'
    });
    next();
};
exports.addSlug = addSlug;
