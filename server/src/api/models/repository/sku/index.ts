import skuModel from '@/models/sku.model.js';
import { SPU_COLLECTION_NAME, SPU_MODEL_NAME } from '@/models/spu.model.js';
import {
    generateFindAll,
    generateFindAllPaganation,
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';
import mongoose from 'mongoose';

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
/* ----------------------- Find by id ----------------------- */
export const findSKUById = generateFindById<model.sku.SKU>(skuModel);

/* ------------------------ Find one ------------------------ */
export const findOneSKU = generateFindOne<model.sku.SKU>(skuModel);

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */
export const findAllSKU = generateFindAll<model.sku.SKU>(skuModel);

export const findAllSKUPaganation = generateFindAllPaganation<model.sku.SKU>(skuModel);


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

/* --------------- Check SKU list is available -------------- */
export const checkSKUListIsAvailable = async (payload: repo.sku.CheckSKUListAvailable) => {
    const { skuList } = payload;

    const result = await skuModel.aggregate([
        {
            $match: {
                sku_id: { $in: skuList.map((id) => new mongoose.Types.ObjectId(id)) },
                is_deleted: false
            }
        },
        {
            $lookup: {
                from: SPU_COLLECTION_NAME,
                localField: 'sku_product',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $match: {
                'product.is_deleted': { $ne: true },
                'product.is_publish': true,
                'product.is_draft': false
            }
        },
        {
            $unwind: 'product'
        }
    ]);

    return result.length === skuList.length;
};

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
export const findSKU = generateFindAll<model.sku.SKU>(skuModel);

export const findSKUPageSpliting = generateFindAllPaganation<model.sku.SKU>(skuModel);

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