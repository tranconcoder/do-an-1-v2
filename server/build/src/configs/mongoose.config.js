"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectId = exports.timestamps = exports.unique = exports.required = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.required = true, exports.unique = true;
exports.timestamps = {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
};
exports.ObjectId = mongoose_1.default.Schema.Types.ObjectId;
