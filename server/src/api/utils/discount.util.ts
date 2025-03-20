import type { DiscountTypeEnum } from '@/enums/discount.enum.js';

export const calculateDiscount = (
    price: number,
    value: number,
    type: DiscountTypeEnum,
    max?: number
) => {
    if (type === DiscountTypeEnum.Fixed) {
        return price - value;
    } else {
        let discount = (price / 100) * value;
        if (max && discount > max) discount = max;

        return discount;
    }
};
