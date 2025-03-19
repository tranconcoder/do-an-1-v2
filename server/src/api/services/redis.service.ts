import { createClient } from 'redis';
import { OptimisticFields } from '../enums/redis.enum.js';
import LoggerService from './logger.service.js';

const redisClient = await createClient()
    .on('error', (err) => {
        const message = `Redis error: ${err}`;

        LoggerService.getInstance().error(message);
    })
    .on('connect', () => {
        console.log('Redis connected!');
    })
    .connect();

export const getOptimisticFieldVersion = async (key: OptimisticFields, id: string) => {
    const redisKey = `ver_${key}_${id}`;

    return await redisClient.multi().setNX(redisKey, '0').get(redisKey).exec();
};
