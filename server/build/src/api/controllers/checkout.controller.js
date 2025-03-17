"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const success_response_1 = require("../response/success.response");
const checkout_service_1 = __importDefault(require("../services/checkout.service"));
class CheckoutController {
    static checkout = async (req, res, _) => {
        new success_response_1.OkResponse({
            message: 'Checkout successfully',
            metadata: await checkout_service_1.default.checkout({
                ...req.body,
                user: req.userId
            })
        }).send(res);
    };
}
exports.default = CheckoutController;
