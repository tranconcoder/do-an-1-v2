"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtDecodeSchema = exports.jwtPayloadSignSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const lodash_1 = __importDefault(require("lodash"));
const joi_config_1 = require("../../../configs/joi.config");
/* ------------------------------------------------------ */
/*                  Token payload schema                  */
/* ------------------------------------------------------ */
const jwtPayload = {
    id: joi_config_1.mongooseId,
    role: joi_1.default.string().required(),
    exp: joi_1.default.number().required(),
    iat: joi_1.default.number().required()
};
exports.jwtPayloadSignSchema = joi_1.default.object(lodash_1.default.pick(jwtPayload, ['id', 'role']));
exports.jwtDecodeSchema = joi_1.default.object(jwtPayload).unknown(true);
