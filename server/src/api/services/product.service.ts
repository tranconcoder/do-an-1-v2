import { ShopStatus } from '@/enums/shop.enum.js';
import { findOneCategory } from '@/models/repository/category/index.js';
import { findOneShop } from '@/models/repository/shop/index.js';
import { spuModel } from '@/models/spu.model.js';
import skuModel from '@/models/sku.model.js';
import inventoryModel from '@/models/inventory.model.js';
import {
    BadRequestErrorResponse,
    ForbiddenErrorResponse,
    NotFoundErrorResponse
} from '@/response/error.response.js';
import {
    findOneSPU,
    findOneAndUpdateSPU
} from '@/models/repository/spu/index.js';
import {
    findOneSKU,
    findOneAndUpdateSKU
} from '@/models/repository/sku/index.js';
import mediaService from './media.service.js';
import skuService from './sku.service.js';
import { SKUImages } from '@/enums/sku.enum.js';
import { SPUImages } from '@/enums/spu.enum.js';
import mongoose from 'mongoose';

export default new (class ProductService {
    /* ----------------------- Get Product for Edit ----------------------- */
    async getProductForEdit(payload: { productId: string; userId: string }) {
        const { productId, userId } = payload;

        // Verify shop ownership
        const shop = await findOneShop({
            query: { shop_userId: userId, is_deleted: false },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        // Get product with populated data
        const product = await findOneSPU({
            query: { _id: productId, product_shop: shop._id, is_deleted: false },
            options: {
                lean: true,
                populate: [
                    { path: 'product_thumb' },
                    { path: 'product_images' },
                    { path: 'product_category' }
                ]
            }
        });
        if (!product) throw new NotFoundErrorResponse({ message: 'Product not found!' });

        // Get SKUs with warehouse info using aggregation
        const skus = await skuModel.aggregate([
            {
                $match: {
                    sku_product: new mongoose.Types.ObjectId(productId),
                    is_deleted: false
                }
            },
            {
                $lookup: {
                    from: 'inventories',
                    localField: '_id',
                    foreignField: 'inventory_sku',
                    as: 'inventory'
                }
            },
            {
                $unwind: {
                    path: '$inventory',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'warehouses',
                    localField: 'inventory.inventory_warehouses',
                    foreignField: '_id',
                    as: 'warehouse'
                }
            },
            {
                $unwind: {
                    path: '$warehouse',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'medias',
                    localField: 'sku_thumb',
                    foreignField: '_id',
                    as: 'thumb_media'
                }
            },
            {
                $unwind: {
                    path: '$thumb_media',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'medias',
                    localField: 'sku_images',
                    foreignField: '_id',
                    as: 'images_media'
                }
            },
            {
                $addFields: {
                    sku_thumb_url: {
                        $cond: {
                            if: '$thumb_media.media_fileName',
                            then: { $concat: ['/media/', '$thumb_media.media_fileName'] },
                            else: null
                        }
                    },
                    sku_images_urls: {
                        $map: {
                            input: '$images_media',
                            as: 'img',
                            in: {
                                id: '$$img._id',
                                url: { $concat: ['/media/', '$$img.media_fileName'] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    inventory: 0,
                    thumb_media: 0,
                    images_media: 0
                }
            }
        ]);

        return {
            product,
            skus
        };
    }

    /* ----------------------- Update Product Info ----------------------- */
    async updateProductInfo(payload: {
        productId: string;
        userId: string;
        product_name?: string;
        product_description?: string;
        product_category?: string;
        product_attributes?: any[];
        product_variations?: any[];
        is_draft?: boolean;
        is_publish?: boolean;
    }) {
        const { productId, userId, ...updateData } = payload;

        // Verify shop ownership
        const shop = await findOneShop({
            query: { shop_userId: userId, is_deleted: false },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        // Verify product exists
        const existingProduct = await findOneSPU({
            query: { _id: productId, product_shop: shop._id, is_deleted: false },
            options: { lean: true }
        });
        if (!existingProduct) throw new NotFoundErrorResponse({ message: 'Product not found!' });

        // Verify category if provided
        if (updateData.product_category) {
            const category = await findOneCategory({
                query: { _id: updateData.product_category, is_active: true, is_deleted: false },
                options: { lean: true }
            });
            if (!category) {
                throw new NotFoundErrorResponse({ message: 'Invalid category!' });
            }
        }

        // Update product
        const updatedProduct = await findOneAndUpdateSPU({
            query: { _id: productId },
            update: { $set: updateData },
            options: { lean: true, new: true }
        });

        return updatedProduct;
    }

    /* ----------------------- Update Product Media ----------------------- */
    async updateProductMedia(payload: {
        productId: string;
        userId: string;
        mediaIds: any;
        action: 'add' | 'replace';
    }) {
        const { productId, userId, mediaIds, action } = payload;

        // Verify shop ownership
        const shop = await findOneShop({
            query: { shop_userId: userId, is_deleted: false },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        // Verify product exists
        const existingProduct = await findOneSPU({
            query: { _id: productId, product_shop: shop._id, is_deleted: false },
            options: { lean: true }
        });
        if (!existingProduct) throw new NotFoundErrorResponse({ message: 'Product not found!' });

        const updateData: any = {};

        // Handle product thumb
        if (mediaIds[SPUImages.PRODUCT_THUMB]?.length) {
            updateData.product_thumb = mediaIds[SPUImages.PRODUCT_THUMB][0];
        }

        // Handle product images
        if (mediaIds[SPUImages.PRODUCT_IMAGES]?.length) {
            if (action === 'replace') {
                updateData.product_images = mediaIds[SPUImages.PRODUCT_IMAGES];
            } else {
                // Add to existing images
                const existingImages = existingProduct.product_images || [];
                updateData.product_images = [...existingImages, ...mediaIds[SPUImages.PRODUCT_IMAGES]];
            }
        }

        // Update product
        const updatedProduct = await findOneAndUpdateSPU({
            query: { _id: productId },
            update: { $set: updateData },
            options: { lean: true, new: true }
        });

        return updatedProduct;
    }

    /* ----------------------- Delete Product Media ----------------------- */
    async deleteProductMedia(payload: {
        productId: string;
        userId: string;
        mediaIds: string[];
        mediaType: 'thumb' | 'images';
    }) {
        const { productId, userId, mediaIds, mediaType } = payload;

        // Verify shop ownership
        const shop = await findOneShop({
            query: { shop_userId: userId, is_deleted: false },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        // Verify product exists
        const existingProduct = await findOneSPU({
            query: { _id: productId, product_shop: shop._id, is_deleted: false },
            options: { lean: true }
        });
        if (!existingProduct) throw new NotFoundErrorResponse({ message: 'Product not found!' });

        // Delete media files
        await Promise.all(
            mediaIds.map(async (mediaId) => {
                await mediaService.hardRemoveMedia(mediaId);
            })
        );

        const updateData: any = {};

        if (mediaType === 'thumb') {
            updateData.product_thumb = null;
        } else {
            // Remove from product_images array
            const remainingImages = existingProduct.product_images.filter(
                (imageId: any) => !mediaIds.includes(imageId.toString())
            );
            updateData.product_images = remainingImages;
        }

        // Update product
        const updatedProduct = await findOneAndUpdateSPU({
            query: { _id: productId },
            update: { $set: updateData },
            options: { lean: true, new: true }
        });

        return updatedProduct;
    }

    /* ----------------------- Update SKU ----------------------- */
    async updateSKU(payload: {
        skuId: string;
        userId: string;
        sku_price?: number;
        sku_stock?: number;
        sku_tier_idx?: number[];
        warehouse?: string;
    }) {
        const { skuId, userId, warehouse, ...updateData } = payload;

        // Verify shop ownership through SKU's product
        const sku = await findOneSKU({
            query: { _id: skuId, is_deleted: false },
            options: { lean: true, populate: 'sku_product' }
        });
        if (!sku) throw new NotFoundErrorResponse({ message: 'SKU not found!' });

        const shop = await findOneShop({
            query: { shop_userId: userId, is_deleted: false },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        // Check if product belongs to shop
        const product = await findOneSPU({
            query: { _id: sku.sku_product, product_shop: shop._id },
            options: { lean: true }
        });
        if (!product) throw new ForbiddenErrorResponse({ message: 'Not authorized to update this SKU!' });

        // Update SKU
        const updatedSKU = await findOneAndUpdateSKU({
            query: { _id: skuId },
            update: { $set: updateData },
            options: { lean: true, new: true }
        });

        // Update warehouse in inventory if provided
        if (warehouse) {
            await inventoryModel.findOneAndUpdate(
                { inventory_sku: skuId },
                { inventory_warehouses: warehouse },
                { upsert: true }
            );
        }

        return updatedSKU;
    }

    /* ----------------------- Create SKU ----------------------- */
    async createSKU(payload: {
        productId: string;
        userId: string;
        sku_price: number;
        sku_stock: number;
        sku_tier_idx: number[];
        warehouse: string;
        mediaIds?: any;
    }) {
        const { productId, userId, mediaIds, ...skuData } = payload;

        // Verify shop ownership
        const shop = await findOneShop({
            query: { shop_userId: userId, is_deleted: false },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        // Verify product exists
        const product = await findOneSPU({
            query: { _id: productId, product_shop: shop._id, is_deleted: false },
            options: { lean: true }
        });
        if (!product) throw new NotFoundErrorResponse({ message: 'Product not found!' });

        // Create SKU using existing service
        const newSKU = await skuService.createSKU({
            sku_price: skuData.sku_price,
            sku_stock: skuData.sku_stock,
            sku_tier_idx: skuData.sku_tier_idx,
            sku_product: productId,
            sku_thumb: mediaIds?.[SKUImages.SKU_THUMB]?.[0],
            sku_images: mediaIds?.[SKUImages.SKU_IMAGES] || [],
            warehouse: skuData.warehouse
        });

        return newSKU;
    }

    /* ----------------------- Delete SKU ----------------------- */
    async deleteSKU(payload: { skuId: string; userId: string }) {
        const { skuId, userId } = payload;

        // Verify shop ownership through SKU's product
        const sku = await findOneSKU({
            query: { _id: skuId, is_deleted: false },
            options: { lean: true, populate: 'sku_product' }
        });
        if (!sku) throw new NotFoundErrorResponse({ message: 'SKU not found!' });

        const shop = await findOneShop({
            query: { shop_userId: userId, is_deleted: false },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        // Check if product belongs to shop
        const product = await findOneSPU({
            query: { _id: sku.sku_product, product_shop: shop._id },
            options: { lean: true }
        });
        if (!product) throw new ForbiddenErrorResponse({ message: 'Not authorized to delete this SKU!' });

        // Soft delete SKU
        await findOneAndUpdateSKU({
            query: { _id: skuId },
            update: { $set: { is_deleted: true } },
            options: { lean: true }
        });

        // Soft delete related inventory
        await inventoryModel.updateMany(
            { inventory_sku: skuId, is_deleted: false },
            { $set: { is_deleted: true, deleted_at: new Date() } }
        );

        return { success: true };
    }
})(); 