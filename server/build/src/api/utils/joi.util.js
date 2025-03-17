"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOptionalObject = void 0;
const toOptionalObject = (obj) => {
    return Object.entries(obj)
        .map(([k, v]) => ({ [k]: v.optional() }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});
};
exports.toOptionalObject = toOptionalObject;
