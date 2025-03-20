import { DiscountTypeEnum } from '@/enums/discount.enum.js';

/* ---------- Calculate with fixed discount value  ---------- */
const calculateFixedDiscount = (price: number, value: number) => {
    return price > value ? price - value : 0;
};

/* -------- Calculate with percentage discount value -------- */
const calculatePercentageDiscount = (price: number, value: number, max: number = price) => {
    let discounted = (price / 100) * value;

    if (discounted > max) discounted = max;

    if (discounted > price) discounted = price;

    return price - discounted;
};

const strategies = {
    [DiscountTypeEnum.Fixed]: calculateFixedDiscount,
    [DiscountTypeEnum.Percentage]: calculatePercentageDiscount
};
const calculateDiscountStrategy = (type: DiscountTypeEnum) => {
    return strategies[type];
};

export const calculateDiscount = (
    type: DiscountTypeEnum,
    price: number,
    value: number,
    max?: number
) => calculateDiscountStrategy(type)(price, value, max);
