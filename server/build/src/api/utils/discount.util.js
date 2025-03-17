"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiscount = void 0;
const discount_enum_1 = require("../enums/discount.enum");
const calculateDiscount = (price, value, type, max) => {
    if (type === discount_enum_1.DiscountTypeEnum.Fixed) {
        return price - value;
    }
    else {
        let discount = (price / 100) * value;
        if (max && discount > max)
            discount = max;
        return discount;
    }
};
exports.calculateDiscount = calculateDiscount;
