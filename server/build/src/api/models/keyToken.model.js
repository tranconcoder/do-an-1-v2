"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEY_TOKEN_COLLECTION_NAME = exports.KEY_TOKEN_MODEL_NAME = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("./user.model");
const mongoose_config_1 = require("../../configs/mongoose.config");
exports.KEY_TOKEN_MODEL_NAME = 'KeyToken';
exports.KEY_TOKEN_COLLECTION_NAME = 'key_tokens';
const keyTokenSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, require, ref: user_model_1.USER_MODEL_NAME },
    private_key: { type: String, required: mongoose_config_1.required },
    public_key: { type: String, required: mongoose_config_1.required },
    refresh_token: { type: String, required: mongoose_config_1.required },
    refresh_tokens_used: { type: [String], default: [] }
}, {
    timestamps: mongoose_config_1.timestamps,
    collection: exports.KEY_TOKEN_COLLECTION_NAME
});
exports.default = (0, mongoose_1.model)(exports.KEY_TOKEN_MODEL_NAME, keyTokenSchema);
