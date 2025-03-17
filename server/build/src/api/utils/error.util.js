"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorStr = void 0;
const getErrorStr = (error) => {
    return `${error.name}: ${error.message}`;
};
exports.getErrorStr = getErrorStr;
