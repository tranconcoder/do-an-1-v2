"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageSplitting = exports.mongooseId = void 0;
const joi_1 = __importDefault(require("joi"));
exports.mongooseId = joi_1.default.string().hex().length(24).required();
exports.pageSplitting = joi_1.default.object({
    page: joi_1.default.number(),
    limit: joi_1.default.number()
});
