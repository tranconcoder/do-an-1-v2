"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var path_1 = require("path");
var NODE_ENV = process.env.NODE_ENV || 'development';
var envPath = path_1.default.join(import.meta.dirname, "../../../.env.".concat(NODE_ENV, ".local"));
dotenv_1.default.config({
    path: envPath,
    override: true
});
