"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_COLLECTION_NAME = exports.ROLE_MODEL_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_config_1 = require("../../configs/mongoose.config");
exports.ROLE_MODEL_NAME = 'Role';
exports.ROLE_COLLECTION_NAME = 'roles';
const roleSchema = new mongoose_1.Schema({
    name: { type: String, required: mongoose_config_1.required, unique: mongoose_config_1.unique },
    description: { type: String }
}, { collection: exports.ROLE_COLLECTION_NAME, timestamps: mongoose_config_1.timestamps });
exports.default = (0, mongoose_1.model)(exports.ROLE_MODEL_NAME, roleSchema, exports.ROLE_COLLECTION_NAME);
