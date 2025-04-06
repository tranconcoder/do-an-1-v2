import skuModel from '@/models/sku.model.js';
import {
    generateFindAll,
    generateFindAllPageSplit,
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
/* ----------------------- Find by id ----------------------- */
export const findSKUById = generateFindById<model.sku.SKU>(skuModel);

/* ------------------------ Find one ------------------------ */
export const findOneSKU = generateFindOne<model.sku.SKU>(skuModel);

/* ---------------------------------------------------------- */
/*                         Find field                         */
/* ---------------------------------------------------------- */
/* ------------------------ Min price ----------------------- */
export const findMinPriceSKU = async (spuId: string) => {
    return await findOneSKU({
        query: { sku_product: spuId },
        only: ['sku_price'],
        options: { sort: { sku_price: 1 }, limit: 1, lean: true }
    }).then((x) => x?.sku_price || null);
};

/* ------------------------ Max price ----------------------- */
export const findMaxPriceSKU = async (spuId: string) => {
    return await findOneSKU({
        query: { sku_product: spuId },
        only: ['sku_price'],
        options: { sort: { sku_price: -1 }, limit: 1, lean: true }
    }).then((x) => x?.sku_price || null);
};

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
export const findSKU = generateFindAll<model.sku.SKU>(skuModel);

export const findSKUPageSpliting = generateFindAllPageSplit<model.sku.SKU>(skuModel);

export const findSKUOfSPU = async (payload: repo.sku.GetSKUOfSKU) => {
    const { spuId } = payload;

    return findSKUPageSpliting({
        query: { sku_product: spuId, is_deleted: false },
        options: { lean: true }
    });
};

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
export const findOneAndUpdateSKU = generateFindOneAndUpdate<model.sku.SKU>(skuModel);