"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = void 0;
const joi_1 = __importDefault(require("joi"));
const joi_config_1 = require("../../../configs/joi.config");
exports.checkout = joi_1.default.object({
    discountId: joi_config_1.mongooseId.optional(),
    shopsDiscount: joi_1.default.array().items(joi_1.default.object({
        discountId: joi_config_1.mongooseId,
        shopId: joi_config_1.mongooseId
    }))
});
