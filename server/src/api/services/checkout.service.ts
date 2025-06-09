import { ForbiddenErrorResponse, InternalServerErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';

/* -------------------------- Enum -------------------------- */
import { CartItemStatus } from '@/enums/cart.enum.js';

/* ------------------------- Utils  ------------------------- */
import { calculateDiscount } from '@/utils/discount.util.js';
import _ from 'lodash';

/* ------------------------ Services ------------------------ */
import DiscountService from './discount.service.js';

/* ------------------------- Models ------------------------- */
import { userModel } from '@/models/user.model.js';
import shopModel from '@/models/shop.model.js';
import { spuModel } from '@/models/spu.model.js';
import skuModel from '@/models/sku.model.js';
import { findOneCartByUser } from '@/models/repository/cart/index.js';
import { findOneDiscount } from '@/models/repository/discount/index.js';
import { findOneAndUpdateCheckout, findOneCheckout } from '@/models/repository/checkout/index.js';
import { findAddressById } from '@/models/repository/address/index.js';
import { Matrix } from './openrouteservice.service.js';
import inventoryService from './inventory.service.js';
import inventoryModel from '@/models/inventory.model.js';
import { findInventory } from '@/models/repository/inventory/index.js';

/* ------------------------- Config ------------------------- */
import locationService from './location.service.js';
import { findOneWarehouse, findWarehouses } from '@/models/repository/warehouses/index.js';
import { getFeeShipByDistance } from '@/utils/checkout.util.js';

export default new (class CheckoutService {
    public async checkout({
        user,
        shopsDiscount = [],
        discountCode,
        addressId
    }: service.checkout.arguments.Checkout) {
        /* ----------------------- Check address ----------------------- */
        const address = await findAddressById({
            id: addressId,
            options: {
                lean: true,
                populate: "location"
            }
        });
        const addressLocation = address?.location as any as model.location.LocationSchema;
        if (!address || !addressLocation || !addressLocation.coordinates)
            throw new NotFoundErrorResponse({ message: 'Not found address!' });

        /* ----------------------- Check cart ----------------------- */
        const cart = await findOneCartByUser({ user: user });
        if (!cart) throw new NotFoundErrorResponse({ message: 'Not found cart!' });

        /* ----------- Select all item selected from cart ----------- */
        cart.cart_shop.forEach((shop) => {
            shop.products = shop.products.filter(
                (product) => product.product_status === CartItemStatus.Active
            );
        });

        console.log("CART TEST:::", cart.cart_shop.map((shop) => shop.products));

        /* ------------------ Initial result data  ------------------ */
        const checkoutResult: service.checkout.definition.CheckoutResult = {
            total_price_raw: 0,
            total_fee_ship: 0,
            total_discount_admin_price: 0,
            total_discount_shop_price: 0,
            total_discount_price: 0,
            total_checkout: 0,
            shops_info: [],
            ship_info: address._id.toString()
        };

        /* --------------------- Admin voucher  --------------------- */
        let totalPriceProductToApplyAdminVoucher = 0;
        const discountAdmin = discountCode && (await findOneDiscount({
            query: { discount_code: discountCode },
            options: { lean: true }
        }));

        if (discountAdmin) {
            if (!discountAdmin.is_admin_voucher)
                throw new ForbiddenErrorResponse({ message: 'Invalid voucher!' });

            /* -------------- Add admin discount to result -------------- */
            checkoutResult.discount = {
                ..._.pick(discountAdmin, [
                    'discount_code',
                    'discount_name',
                    'discount_type',
                    'discount_value'
                ]),
                discount_id: discountAdmin._id
            };
        }

        /* ----------------------- Each shop  ----------------------- */
        await Promise.all(
            cart.cart_shop.map(async (shop) => {
                const foundShop = await shopModel.findById(shop.shop);
                if (!foundShop) throw new NotFoundErrorResponse({ message: 'Not found shop!' });

                const skuIds = shop.products.map((x) => x.sku);

                /* --------------- Get inventories info --------------- */
                const inventories = await findInventory({
                    query: {
                        inventory_shop: shop.shop,
                        inventory_sku: { $in: skuIds },
                    },
                    only: ['inventory_warehouses'],
                    options: {
                        lean: true,
                    }
                });

                /* --------------- Get warehouses info --------------- */
                const warehousesIds = inventories.map((x: any) => x.inventory_warehouses.toString());
                // Remove duplicate warehouse IDs
                const uniqueWarehouseIds = [...new Set(warehousesIds)];
                const warehouses = await Promise.all(
                    uniqueWarehouseIds.map(async (x) => {
                        return await findOneWarehouse({
                            query: { _id: x },
                            only: ['address', "_id", "name"] as any,
                            options: {
                                lean: true,
                                populate: {
                                    path: "address",
                                    populate: [
                                        { path: "ward" },
                                        { path: "district" },
                                        { path: "province" }
                                    ]
                                }
                            }
                        });
                    })
                )

                const warehouseCoordinates = await Promise.all(
                    warehouses.map(async (x) => {
                        const location = x.address as any as model.location.LocationSchema;

                        if (!location || !location.coordinates)
                            return null;

                        // Build full address string
                        let fullAddress = location.address || '';
                        if ((location.ward as any)?.ward_name) {
                            fullAddress += `, ${(location.ward as any).ward_name}`;
                        }
                        if ((location.district as any)?.district_name) {
                            fullAddress += `, ${(location.district as any).district_name}`;
                        }
                        if ((location.province as any)?.province_name) {
                            fullAddress += `, ${(location.province as any).province_name}`;
                        }

                        return {
                            x: location.coordinates.x!,
                            y: location.coordinates.y!,
                            warehouse_id: x._id.toString(),
                            warehouse_name: x.name,
                            warehouse_address: fullAddress
                        }
                    })
                ).then((x) => x.filter((x: any) => x !== null));
                if (!warehouseCoordinates || !Array.isArray(warehouseCoordinates)) {
                    throw new InternalServerErrorResponse({ message: 'Failed to get warehouse coordinates!' });
                }

                /* --------- Get distance nearest warehouse --------- */
                const distanceRes = await Matrix.calculate({
                    locations: [
                        [addressLocation.coordinates?.x!, addressLocation.coordinates?.y!],
                        ...warehouseCoordinates.map(item => [item?.x, item?.y])
                    ],
                    profile: 'driving-car',
                    sources: [0],
                    destinations: Array.from({ length: warehouseCoordinates.length }, (_, i) => i + 1),
                    metrics: ['distance', 'duration']
                }).catch((err: any) => {
                    console.log("DISTANCE ERR TEST:::", err);
                    return null;
                });
                if (!distanceRes)
                    throw new InternalServerErrorResponse({ message: 'Failed to calculate distance!' });

                /* --------------- Caculate shipping fee --------------- */
                const totalDistanceShop =
                    distanceRes.distances[0].reduce((acc: number, cur: number) => acc + (cur / 1000), 0);
                const avgDistancePerShop =
                    totalDistanceShop / shop.products.length;
                const feeShipShop =
                    getFeeShipByDistance(avgDistancePerShop);

                console.log("HOME COORDINATES TEST:::", [addressLocation.coordinates?.x!, addressLocation.coordinates?.y!]);
                console.log("WAREHOUSE COORDINATES TEST:::", warehouseCoordinates);
                console.log("FEE SHIP TEST:::", feeShipShop);
                console.log("AVG DISTANCE PER SHOP TEST:::", avgDistancePerShop);
                console.log("ALL DISTANCE TEST:::", totalDistanceShop);
                checkoutResult.total_fee_ship += feeShipShop;

                /* -------------- Initial total price raw shop -------------- */
                let totalPriceRawShop = 0;

                /* ----------------- Get discount shop info ----------------- */
                const discountInfo = shopsDiscount.find(
                    (discount) => discount.shopId === shop.shop.toString()
                );
                const discount =
                    discountInfo && (await findOneDiscount({
                        query: {
                            discount_code: discountInfo.discountCode
                        },
                        options: {
                            lean: true
                        }
                    }));
                console.log("DISCOUNT INFO TEST:::", discount, discountInfo);

                /* ------------- Get amount of discount by shop ------------- */
                const discountPriceShop = discount
                    ? (
                        await DiscountService.getDiscountAmount({
                            discountCode: discount.discount_code,
                            products: shop.products.map((x) => ({
                                id: x.sku.toString(),
                                quantity: x.cart_quantity,
                            }))
                        })
                    ).totalDiscount
                    : 0;

                console.log("DISCOUNT PRICE SHOP TEST:::", discountPriceShop);

                const productsInfo = await Promise.all(shop.products.map(async (product) => {
                    totalPriceRawShop += product.cart_quantity * product.product_price;

                    /* --------------- Get SKU and SPU info for discount check --------------- */
                    const sku = await skuModel.findById(product.sku).populate('sku_product').lean();
                    const spu = sku?.sku_product as any;

                    /* --------------- Calculating admin discount --------------- */
                    if (
                        discountAdmin &&
                        discountAdmin.is_available &&
                        spu &&
                        (discountAdmin.is_apply_all_product ||
                            discountAdmin?.discount_skus // Note: field name is still discount_skus but contains SPU IDs
                                ?.map((x: any) => x.toString())
                                ?.includes(spu._id.toString()))
                    ) {
                        totalPriceProductToApplyAdminVoucher += product.cart_quantity * product.product_price;
                    }

                    return {
                        id: product.sku.toString(),
                        name: product.product_name,
                        quantity: product.cart_quantity,
                        thumb: product.product_thumb,
                        price: product.product_price,
                        price_raw: product.cart_quantity * product.product_price
                    };
                }));

                /* ---------------------- Each product ---------------------- */
                checkoutResult.shops_info.push({
                    shop_id: foundShop._id.toString(),
                    shop_name: foundShop.shop_name,
                    discount: discount
                        ? {
                            ..._.pick(discount, [
                                'discount_name',
                                'discount_type',
                                'discount_value',
                                'discount_code'
                            ]),
                            discount_id: discount._id
                        }
                        : undefined,
                    warehouses_info: warehouseCoordinates.map((warehouse, index) => ({
                        warehouse_id: warehouse!.warehouse_id,
                        warehouse_name: warehouse!.warehouse_name,
                        warehouse_address: warehouse!.warehouse_address,
                        distance_km: Math.round((distanceRes.distances[0][index] / 1000) * 100) / 100
                    })),
                    fee_ship: feeShipShop,
                    total_discount_price: discountPriceShop,
                    total_price_raw: totalPriceRawShop,
                    products_info: productsInfo.map((product) => {
                        return {
                            ...product,
                            thumb: product.thumb.toString()
                        };
                    })
                });
            })
        );

        checkoutResult.total_price_raw = checkoutResult.shops_info.reduce(
            (acc, cur) => cur.total_price_raw + acc,
            0
        );
        checkoutResult.total_fee_ship = checkoutResult.shops_info.reduce(
            (acc, cur) => cur.fee_ship + acc,
            0
        );
        checkoutResult.total_discount_shop_price = checkoutResult.shops_info.reduce(
            (acc, cur) => cur.total_discount_price + acc,
            0
        );
        checkoutResult.total_discount_admin_price = discountAdmin
            ? calculateDiscount(
                discountAdmin.discount_type,
                totalPriceProductToApplyAdminVoucher,
                discountAdmin.discount_value,
                discountAdmin.discount_max_value
            )
            : 0;

        checkoutResult.total_discount_price =
            checkoutResult.total_discount_shop_price + checkoutResult.total_discount_admin_price;

        checkoutResult.total_checkout =
            checkoutResult.total_price_raw +
            checkoutResult.total_fee_ship -
            checkoutResult.total_discount_price;

        return await findOneAndUpdateCheckout({
            query: { user },
            update: {
                ...checkoutResult,
                user
            },
            options: { new: true, upsert: true }
        });
    }

    public async getCheckout({ user }: { user: string }) {
        const checkout = await findOneCheckout({
            query: { user },
            options: { lean: true }
        });

        if (!checkout) {
            throw new NotFoundErrorResponse({ message: 'No checkout data found!' });
        }

        return checkout;
    }
})();
