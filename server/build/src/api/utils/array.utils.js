"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncFilter = asyncFilter;
async function asyncFilter(source, cb) {
    // Handle all promises
    const promises = await Promise.all(source.map(cb));
    // Filter
    return source.filter((_, index) => promises[index]);
}
