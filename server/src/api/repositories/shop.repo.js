import { ShopStatus } from '~/constants/shop.enum.js';

export async function findAllPendingShop({ limit, page, select }) {
    const filter = {
        shop_status: ShopStatus.PENDING
    };

    const options = {
        page,
        limit,
        select: select ? select.join(' ') : ''
    };

    return await shopModel.paginate(filter, options);
}

export async function findShopById({ id, select = [] }) {
    return await shopModel.findById(id).select(select && select.length ? select.join(' ') : '');
}
