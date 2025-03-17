"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClothesSchema = exports.createClothesSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/* ====================================================== */
/*                     CREATE CLOUTHES                    */
/* ====================================================== */
exports.createClothesSchema = joi_1.default.object({
    size: joi_1.default.string().required(),
    color: joi_1.default.string().required()
});
/* ====================================================== */
/*                     UPDATE CLOTHES                     */
/* ====================================================== */
exports.updateClothesSchema = joi_1.default.object({
    size: joi_1.default.string(),
    color: joi_1.default.string()
});
