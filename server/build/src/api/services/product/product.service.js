"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = require("../../models/product.model");
const product_1 = require("../../models/repository/product");
const mongoose_util_1 = require("../../utils/mongoose.util");
const product_2 = require("../../models/repository/product");
const index_1 = require("../../models/repository/inventory/index");
const error_response_1 = require("../../response/error.response");
class Product {
    _id;
    product_slug;
    product_rating_avg;
    product_shop;
    product_name;
    product_cost;
    product_thumb;
    product_quantity;
    product_description;
    product_category;
    product_new_category;
    product_attributes;
    is_draft;
    is_publish;
    constructor({ _id, product_slug, product_rating_avg, product_shop, product_name, product_cost, product_thumb, product_quantity, product_description, product_category, product_attributes, is_draft, is_publish }) {
        this._id = _id;
        this.product_slug = product_slug;
        this.product_rating_avg = product_rating_avg;
        this.product_shop = product_shop;
        this.product_name = product_name;
        this.product_cost = product_cost;
        this.product_thumb = product_thumb;
        this.product_quantity = product_quantity;
        this.product_description = product_description;
        this.product_category = product_category;
        this.product_attributes = product_attributes;
        this.is_draft = is_draft;
        this.is_publish = is_publish;
    }
    /* ------------------------------------------------------ */
    /*                     Create product                     */
    /* ------------------------------------------------------ */
    async createProduct() {
        this._id = new mongoose_1.default.Types.ObjectId(); // Generate new id
        const payload = this.getValidProperties();
        return await Promise.all([
            /* -------------------- Create inventory -------------------- */
            (0, index_1.createInventory)({
                inventory_product: payload._id,
                inventory_stock: payload.product_quantity,
                inventory_shop: payload.product_shop
            }),
            /* --------------------- Create product --------------------- */
            (0, product_1.createProduct)(payload)
        ])
            /* ------------- Return created product to user ------------- */
            .then(([, product]) => product);
    }
    /* ------------------------------------------------------ */
    /*                     Update product                     */
    /* ------------------------------------------------------ */
    async updateProduct() {
        const validProperties = this.getValidProperties();
        /* --------- Update inventory quantity when exists  --------- */
        if (validProperties.product_quantity) {
            const updateStockSuccess = (0, index_1.updateInventoryStock)(validProperties._id?.toString(), validProperties.product_quantity);
            if (!updateStockSuccess)
                throw new error_response_1.BadRequestErrorResponse('Error update quantity!');
        }
        /* ------------------- Init set object ------------------ */
        const $set = {};
        (0, mongoose_util_1.get$SetNestedFromObject)(validProperties, $set);
        return await product_model_1.productModel.findOneAndUpdate({ _id: this._id }, { $set }, { new: true });
    }
    /* ------------------------------------------------------ */
    /*                     Remove product                     */
    /* ------------------------------------------------------ */
    async removeProduct() {
        return await (0, product_2.deleteOneProduct)({
            _id: this._id,
            product_shop: this.product_shop
        });
    }
    getValidProperties() {
        const validProperties = {};
        Object.keys(this).forEach((k) => {
            const key = k;
            if (this[key] !== undefined) {
                Object.assign(validProperties, { [key]: this[key] });
            }
        });
        return validProperties;
    }
    getProductShop() {
        return this.product_shop;
    }
    getProductId() {
        return this._id;
    }
    setProductId(id) {
        this._id = id;
    }
}
exports.Product = Product;
