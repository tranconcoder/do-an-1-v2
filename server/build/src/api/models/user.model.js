"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.USER_COLLECTION_NAME = exports.USER_MODEL_NAME = void 0;
const mongoose_1 = require("mongoose");
const role_model_1 = require("./role.model");
const mongoose_config_1 = require("../../configs/mongoose.config");
exports.USER_MODEL_NAME = 'User';
exports.USER_COLLECTION_NAME = 'users';
const userSchema = new mongoose_1.Schema({
    phoneNumber: { type: String, length: 10, required: mongoose_config_1.required, unique: mongoose_config_1.unique },
    email: { type: String, unique: mongoose_config_1.unique },
    password: { type: String, required: mongoose_config_1.required },
    fullName: { type: String, required: mongoose_config_1.required },
    role: { type: mongoose_1.Schema.Types.ObjectId, required: mongoose_config_1.required, ref: role_model_1.ROLE_MODEL_NAME },
    dayOfBirth: Date
}, {
    collection: exports.USER_COLLECTION_NAME,
    timestamps: mongoose_config_1.timestamps
});
exports.userModel = (0, mongoose_1.model)(exports.USER_MODEL_NAME, userSchema);
