import {
    CLEAN_UP_KEY_TOKEN_CRON_TIME,
    CLEAN_UP_PRODUCT_CRON_TIME,
    getCronOptions
} from '@/configs/scheduled.config.js';

// Models
import keyTokenModel from '@/models/keyToken.model.js';
import { spuModel } from '@/models/spu.model.js';

// Services
import JwtService from './jwt.service.js';
import LoggerService from './logger.service.js';

// Libs
import { CronJob } from 'cron';
import { asyncFilter } from '@/utils/array.utils.js';
import mongoose from 'mongoose';
import { deleteKeyToken, setKeyToken } from './redis.service.js';

export default class ScheduledService {
    public static startScheduledService = () => {
        this.cleanUpKeyTokenCronJob.start();
        this.cleanUpProductCronJob.start();
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
    /*                       Cron jobs                        */
    /* ------------------------------------------------------ */
    public static cleanUpKeyTokenCronJob = CronJob.from(
        getCronOptions({
            cronTime: CLEAN_UP_KEY_TOKEN_CRON_TIME,
            onTick: ScheduledService.handleCleanUpKeyToken,
            onComplete: () => {}
        })
    );
    public static cleanUpProductCronJob = CronJob.from(
        getCronOptions({
            cronTime: CLEAN_UP_PRODUCT_CRON_TIME,
            onTick: ScheduledService.handleCleanUpProduct
        })
    );
}
