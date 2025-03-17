"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVENTORY_COLLECTION_NAME = exports.INVENTORY_MODEL_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_config_1 = require("../../configs/mongoose.config");
const product_model_1 = require("./product.model");
const user_model_1 = require("./user.model");
exports.INVENTORY_MODEL_NAME = 'Inventory';
exports.INVENTORY_COLLECTION_NAME = 'inventories';
const inventorySchema = new mongoose_1.Schema({
    inventory_product: {
        type: mongoose_config_1.ObjectId,
        ref: product_model_1.PRODUCT_MODEL_NAME,
        required: mongoose_config_1.required
    },
    inventory_shop: {
        type: mongoose_config_1.ObjectId,
        ref: user_model_1.USER_MODEL_NAME,
        required: mongoose_config_1.required
    },
    inventory_location: {
        type: String,
        default: 'Unknown'
    },
    inventory_stock: {
        type: Number,
        required: mongoose_config_1.required
    },
    inventory_reservations: {
        type: [
            {
                reservation_user: {
                    type: mongoose_config_1.ObjectId,
                    ref: user_model_1.USER_MODEL_NAME,
                    required: mongoose_config_1.required
                },
                reservation_quantity: {
                    type: Number,
                    required: mongoose_config_1.required
                },
                reservation_at: {
                    type: Date,
                    default: Date.now
                },
                deleted_at: {
                    type: Date,
                    default: null
                }
            }
        ],
        default: []
    }
}, {
    collection: exports.INVENTORY_COLLECTION_NAME,
    timestamps: mongoose_config_1.timestamps
});
exports.default = (0, mongoose_1.model)(exports.INVENTORY_MODEL_NAME, inventorySchema);
