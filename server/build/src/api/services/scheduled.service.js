"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scheduled_config_1 = require("./../../configs/scheduled.config");
// Models
const keyToken_model_1 = __importDefault(require("../models/keyToken.model"));
const product_model_1 = require("../models/product.model");
// Services
const jwt_service_1 = __importDefault(require("./jwt.service"));
const logger_service_1 = __importDefault(require("./logger.service"));
// Libs
const cron_1 = require("cron");
const array_utils_1 = require("../utils/array.utils");
const mongoose_1 = __importDefault(require("mongoose"));
const product_enum_1 = require("../enums/product.enum");
const index_1 = require("../models/repository/product/index");
class ScheduledService {
    static startScheduledService = () => {
        this.cleanUpKeyTokenCronJob.start();
        this.cleanUpProductCronJob.start();
    };
    /* ------------------------------------------------------ */
    /*          Clenaup key token expired or banned           */
    /* ------------------------------------------------------ */
    static handleCleanUpKeyToken = async () => {
        const allKeyTokens = await keyToken_model_1.default.find();
        /* -------------------- Reset counter ------------------- */
        let keyTokenCleaned = 0, refeshTokenUsedCleaned = 0;
        await Promise.allSettled(allKeyTokens.map(async (keyToken) => {
            /* ------------- Check current refresh token ------------ */
            const decoded = await jwt_service_1.default.verifyJwt({
                token: keyToken.refresh_token,
                publicKey: keyToken.public_key
            });
            if (!decoded) {
                await keyToken.deleteOne();
                throw new Error('Invalid key token');
            }
            /* -------------- Check used refresh token -------------- */
            const newRefreshTokensUsed = await (0, array_utils_1.asyncFilter)(keyToken.refresh_tokens_used, async (refreshTokenUsed) => {
                const payload = jwt_service_1.default.parseJwtPayload(refreshTokenUsed);
                if (!payload)
                    return false;
                if (payload.exp * 1000 <= Date.now())
                    return false;
                return true;
            });
            /* ----------------- Update cleanup data ---------------- */
            keyToken.set('refresh_tokens_used', newRefreshTokensUsed);
            await keyToken.save();
            /* --------- Counting refreh token used removed --------- */
            refeshTokenUsedCleaned +=
                keyToken.refresh_tokens_used.length -
                    newRefreshTokensUsed.length;
            return true;
        }))
            /* -------------- Couting key token removed ------------- */
            .then((resultList) => {
            keyTokenCleaned = resultList.filter((x) => x.status === 'rejected').length;
        })
            /* --------------------- Show result -------------------- */
            .then(() => {
            logger_service_1.default.getInstance().info(`Cleanup key token: ${keyTokenCleaned} key token cleaned`);
            logger_service_1.default.getInstance().info(`Cleanup key token: ${refeshTokenUsedCleaned} refresh token used cleaned`);
        });
    };
    /* ------------------------------------------------------ */
    /*                  Cleanup product data                  */
    /* ------------------------------------------------------ */
    static handleCleanUpProduct = async () => {
        /* ----------------- Get product id list ---------------- */
        const productIds = new Set(await (0, index_1.findAllProductId)({}));
        /* -------------- Get product child id list ------------- */
        const productChildModelName = Object.values(product_enum_1.CategoryEnum);
        const productChildsList = await Promise.all(productChildModelName.map(async (modelName) => {
            const model = mongoose_1.default.model(modelName);
            if (!model)
                throw new Error(`Model '${modelName}' not found`);
            const childList = await model.find().select('_id').lean();
            return childList.map((x) => x._id.toString());
        }));
        /* --------------- Clean in product model --------------- */
        const productChildSet = new Set(productChildsList.flat());
        const productDifference = productIds.difference(productChildSet);
        await Promise.all([
            product_model_1.productModel.deleteMany({
                _id: { $in: Array.from(productDifference) }
            }),
            ...productChildsList.map(async (childList, index) => {
                const childSet = new Set(childList);
                const difference = childSet.difference(productIds);
                const model = mongoose_1.default.model(productChildModelName[index]);
                return await model.deleteMany({
                    _id: { $in: Array.from(difference) }
                });
            })
        ]).then((results) => {
            const { deletedCount } = results.flat().reduce((a, b) => ({
                deletedCount: a.deletedCount + b.deletedCount
            }), { deletedCount: 0 });
            logger_service_1.default.getInstance().info(`Cleanup product: Cleaned ${deletedCount} products`);
        });
    };
    /* ------------------------------------------------------ */
    /*                       Cron jobs                        */
    /* ------------------------------------------------------ */
    static cleanUpKeyTokenCronJob = cron_1.CronJob.from((0, scheduled_config_1.getCronOptions)({
        cronTime: scheduled_config_1.CLEAN_UP_KEY_TOKEN_CRON_TIME,
        onTick: ScheduledService.handleCleanUpKeyToken,
        onComplete: () => { }
    }));
    static cleanUpProductCronJob = cron_1.CronJob.from((0, scheduled_config_1.getCronOptions)({
        cronTime: scheduled_config_1.CLEAN_UP_PRODUCT_CRON_TIME,
        onTick: ScheduledService.handleCleanUpProduct
    }));
}
exports.default = ScheduledService;
