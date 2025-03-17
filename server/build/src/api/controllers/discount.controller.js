"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const success_response_1 = __importStar(require("../response/success.response"));
const discount_service_1 = __importDefault(require("../services/discount.service"));
class DiscountController {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    /* -------------------- Create discount  -------------------- */
    static createDiscount = async (req, res, _) => {
        new success_response_1.CreatedResponse({
            message: 'Discount created successfully',
            metadata: await discount_service_1.default.createDiscount({
                ...req.body,
                userId: req.userId
            })
        }).send(res);
    };
    /* ---------------------------------------------------------- */
    /*                            Get                             */
    /* ---------------------------------------------------------- */
    /* ------------- Get all discount code in shop  ------------- */
    static getAllDiscountCodeInShop = async (req, res, _) => {
        new success_response_1.default({
            name: 'Get all discount code in shop',
            statusCode: 200,
            message: 'Get all discount code in shop successfully',
            metadata: await discount_service_1.default.getAllDiscountCodeInShop({
                limit: req.query.limit,
                page: req.query.page,
                shopId: req.params.shopId
            })
        }).send(res);
    };
    /* ------------ Get all product discount by code ------------ */
    static getAllProductDiscountByCode = async (req, res, _) => {
        new success_response_1.OkResponse({
            message: 'Get all product discount by code successfully',
            metadata: await discount_service_1.default.getAllProductDiscountByCode({
                discountId: req.params.discountId,
                limit: req.query.limit,
                page: req.query.page
            })
        }).send(res);
    };
    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */
    static updateDiscount = async (req, res, _) => {
        new success_response_1.OkResponse({
            message: 'Update discount success!',
            metadata: await discount_service_1.default.updateDiscount({
                ...req.body,
                discount_shop: req.userId
            })
        }).send(res);
    };
    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    /* -------------------- Delete discount  -------------------- */
    static deleteDiscount = async (req, res, _) => {
        new success_response_1.default({
            statusCode: 200,
            name: 'Delete discount',
            message: 'Delete success!',
            metadata: await discount_service_1.default.deleteDiscount({
                discountId: req.params.discountId,
                productShop: req.userId
            })
        }).send(res);
    };
}
exports.default = DiscountController;
