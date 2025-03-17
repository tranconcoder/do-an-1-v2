"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const NODE_ENV = process.env.NODE_ENV || 'development';
const envPath = path_1.default.join(__dirname, `../../../.env.${NODE_ENV}.local`);
dotenv_1.default.config({
    path: envPath,
    override: true
});
