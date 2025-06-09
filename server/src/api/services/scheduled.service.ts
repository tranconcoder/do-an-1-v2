import {
    CLEAN_UP_KEY_TOKEN_CRON_TIME,
    CLEAN_UP_PRODUCT_CRON_TIME,
    SYNC_INVENTORY_SKU_CRON_TIME,
    getCronOptions
} from '@/configs/scheduled.config.js';

// Models
import keyTokenModel from '@/models/keyToken.model.js';
import { spuModel } from '@/models/spu.model.js';
import inventoryModel from '@/models/inventory.model.js';
import skuModel from '@/models/sku.model.js';

// Services
import JwtService from './jwt.service.js';
import LoggerService from './logger.service.js';

// Libs
import { CronJob } from 'cron';
import { asyncFilter } from '@/utils/array.utils.js';
import mongoose from 'mongoose';
import { deleteKeyToken, setKeyToken } from './redis.service.js';

export default class ScheduledService {
    private static lastSyncTime: Date | null = null;

    public static startScheduledService = () => {
        this.cleanUpKeyTokenCronJob.start();
        this.cleanUpProductCronJob.start();
        this.syncInventorySkuCronJob.start();
    };

    /* ------------------------------------------------------ */
    /*          Cleanup key token expired or banned           */
    /* ------------------------------------------------------ */
    private static handleCleanUpKeyToken = async () => {
        const allKeyTokens = await keyTokenModel.find();

        /* -------------------- Reset counter ------------------- */
        let keyTokenCleaned = 0,
            refreshTokenUsedCleaned = 0;

        await Promise.allSettled(
            allKeyTokens.map(async (keyToken) => {
                /* ------------- Check current refresh token ------------ */
                const decoded = await JwtService.verifyJwt({
                    token: keyToken.refresh_token,
                    publicKey: keyToken.public_key
                });

                if (!decoded) {
                    await keyToken.deleteOne();
                    await deleteKeyToken(keyToken.user.toString());

                    throw new Error('Invalid key token');
                }

                /* -------------- Check used refresh token -------------- */
                const newRefreshTokensUsed = await asyncFilter(
                    keyToken.refresh_tokens_used,
                    async (refreshTokenUsed) => {
                        const payload = JwtService.parseJwtPayload(refreshTokenUsed);

                        if (!payload) return false;
                        if (payload.exp * 1000 <= Date.now()) return false;

                        return true;
                    }
                );

                /* ----------------- Update cleanup data ---------------- */
                keyToken.set('refresh_tokens_used', newRefreshTokensUsed);

                await keyToken.save();
                await setKeyToken(keyToken.toObject());

                /* --------- Counting refresh token used removed --------- */
                refreshTokenUsedCleaned +=
                    keyToken.refresh_tokens_used.length - newRefreshTokensUsed.length;

                return true;
            })
        )
            /* -------------- Counting key token removed ------------- */
            .then((resultList) => {
                keyTokenCleaned = resultList.filter((x) => x.status === 'rejected').length;
            })
            /* --------------------- Show result -------------------- */
            .then(() => {
                LoggerService.getInstance().info(
                    `Cleanup key token: ${keyTokenCleaned} key token cleaned`
                );
                LoggerService.getInstance().info(
                    `Cleanup key token: ${refreshTokenUsedCleaned} refresh token used cleaned`
                );
            });
    };

    /* ------------------------------------------------------ */
    /*                  Cleanup product data                  */
    /* ------------------------------------------------------ */
    private static handleCleanUpProduct = async () => {
        /* ----------------- Get product id list ---------------- */
        // const productIds = new Set(await findAllProductId({}));
        // /* -------------- Get product child id list ------------- */
        // const productChildModelName = Object.values(CategoryEnum);
        // const productChildsList = await Promise.all(
        //     productChildModelName.map(async (modelName) => {
        //         const model = mongoose.model(modelName);
        //         if (!model) throw new Error(`Model '${modelName}' not found`);
        //         const childList = await model.find().select('_id').lean();
        //         return childList.map((x: any) => x._id.toString());
        //     })
        // );
        // /* --------------- Clean in product model --------------- */
        // const productChildSet = new Set(productChildsList.flat());
        // const productDifference = productIds.difference(productChildSet);
        // await Promise.all([
        //     spuModel.deleteMany({
        //         _id: { $in: Array.from(productDifference) }
        //     }),
        //     ...productChildsList.map(async (childList, index) => {
        //         const childSet = new Set(childList);
        //         const difference = childSet.difference(productIds);
        //         const model = mongoose.model(productChildModelName[index]);
        //         return await model.deleteMany({
        //             _id: { $in: Array.from(difference) }
        //         });
        //     })
        // ]).then((results) => {
        //     const { deletedCount } = results.flat().reduce(
        //         (a, b) => ({
        //             deletedCount: a.deletedCount + b.deletedCount
        //         }),
        //         { deletedCount: 0 }
        //     );
        //     LoggerService.getInstance().info(`Cleanup product: Cleaned ${deletedCount} products`);
        // });
    };

    /* ------------------------------------------------------ */
    /*              Sync inventory stock with SKU             */
    /* ------------------------------------------------------ */
    private static handleSyncInventorySku = async () => {
        try {
            console.log('🔄 Starting inventory-SKU sync...');

            // Get all inventories with populated SKU information  
            // Only sync recently updated inventories (within last 5 minutes) or force sync every 10 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const shouldForceSync = !this.lastSyncTime || this.lastSyncTime < tenMinutesAgo;

            const inventories = await inventoryModel
                .find({
                    is_deleted: false,
                    ...(shouldForceSync ? {} : { updated_at: { $gte: fiveMinutesAgo } })
                })
                .populate('inventory_sku')
                .lean();

            if (inventories.length === 0) {
                console.log(`📦 No inventories found to sync ${shouldForceSync ? '(force sync)' : '(recent updates)'}`);
                return;
            }

            console.log(`📦 Found ${inventories.length} inventories to sync ${shouldForceSync ? '(force sync)' : '(recent updates)'}`);
            this.lastSyncTime = new Date();

            let syncCount = 0;
            let errorCount = 0;
            let skippedCount = 0;
            const bulkOps: any[] = [];

            // Process each inventory
            for (const inventory of inventories) {
                try {
                    const sku = inventory.inventory_sku as any;

                    if (!sku || !sku._id) {
                        console.warn(`SKU not found for inventory: ${inventory._id}`);
                        errorCount++;
                        continue;
                    }

                    // Calculate available stock (total stock - reservations)
                    const reservedQuantity = inventory.inventory_reservations
                        ?.filter(reservation => !reservation.deleted_at)
                        .reduce((total, reservation) => total + reservation.reservation_quantity, 0) || 0;

                    const availableStock = Math.max(0, inventory.inventory_stock - reservedQuantity);

                    // Check if update is needed
                    if (sku.sku_stock !== availableStock) {
                        bulkOps.push({
                            updateOne: {
                                filter: { _id: sku._id },
                                update: { $set: { sku_stock: availableStock } }
                            }
                        });

                        syncCount++;
                        console.log(`✅ Will sync SKU ${sku._id}: ${sku.sku_stock} → ${availableStock}`);
                    } else {
                        skippedCount++;
                    }
                } catch (error) {
                    console.error(`❌ Error processing inventory ${inventory._id}:`, error);
                    errorCount++;
                }
            }

            // Execute bulk operations if any
            if (bulkOps.length > 0) {
                const bulkResult = await skuModel.bulkWrite(bulkOps);
                console.log(`📊 Bulk update result: ${bulkResult.modifiedCount} SKUs updated`);
            }

            // Log summary results
            const totalProcessed = syncCount + skippedCount + errorCount;
            LoggerService.getInstance().info(
                `Inventory-SKU Sync: ${totalProcessed} processed, ${syncCount} updated, ${skippedCount} skipped, ${errorCount} errors`
            );

            if (syncCount > 0) {
                console.log(`🎉 Successfully synchronized ${syncCount} SKU stock quantities`);
            } else {
                console.log('✨ All SKU stocks are already in sync');
            }

        } catch (error) {
            console.error('❌ Error in inventory-SKU sync:', error);
            LoggerService.getInstance().error(`Inventory-SKU sync failed: ${error}`);
        } finally {
            console.log('🏁 Inventory-SKU sync completed');
        }
    };

    /* ------------------------------------------------------ */
    /*                       Cron jobs                        */
    /* ------------------------------------------------------ */
    public static cleanUpKeyTokenCronJob = CronJob.from(
        getCronOptions({
            cronTime: CLEAN_UP_KEY_TOKEN_CRON_TIME,
            onTick: ScheduledService.handleCleanUpKeyToken,
            onComplete: () => { }
        })
    );
    public static cleanUpProductCronJob = CronJob.from(
        getCronOptions({
            cronTime: CLEAN_UP_PRODUCT_CRON_TIME,
            onTick: ScheduledService.handleCleanUpProduct
        })
    );

    public static syncInventorySkuCronJob = CronJob.from(
        getCronOptions({
            cronTime: SYNC_INVENTORY_SKU_CRON_TIME,
            onTick: ScheduledService.handleSyncInventorySku,
            onComplete: () => { }
        })
    );
}
