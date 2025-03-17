"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtSignAsync = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtSignAsync = async (payload, privateKey, options) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(payload, privateKey, options, (err, token) => {
            if (err || !token) {
                return reject(err);
            }
            resolve(token);
        });
    });
};
exports.jwtSignAsync = jwtSignAsync;
