"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventoryStock = exports.createInventory = void 0;
const inventory_model_1 = __importDefault(require("../../inventory.model"));
/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
const createInventory = async (payload) => {
    return await inventory_model_1.default.create(payload);
};
exports.createInventory = createInventory;
/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
/* ----------------- Update inventory stock ----------------- */
const updateInventoryStock = async (productId, newStock) => {
    return ((await inventory_model_1.default.updateOne({ inventory_product: productId }, { inventory_stock: newStock })).modifiedCount > 0);
};
exports.updateInventoryStock = updateInventoryStock;
