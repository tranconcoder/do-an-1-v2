import { sleep } from '../utils/promise.util.js';
import ms from 'ms';
import { createClient } from 'redis';
import { PessimisticKeys } from '../enums/redis.enum.js';
import LoggerService from './logger.service.js';
import {
    PESSIMISTIC_EXPIRE_TIME,
    PESSIMISTIC_RETRY_TIMES,
    PESSIMISTIC_WAITING_TIME
} from '@/configs/redis.config.js';

const redisClient = await createClient()
    .on('error', (err) => {
        const message = `Redis error: ${err}`;

        LoggerService.getInstance().error(message);
    })
    .on('connect', () => {
        console.log('Redis connected!');
    })
    .connect();

export const pessimisticLock = async <T = any>(
    key: PessimisticKeys,
    id: string,
    cb: () => Promise<T>
): Promise<commonTypes.utils.AutoType<T> | null> => {
    const redisKey = `pessLock_${key}_${id}`;

    for (let i = 0; i < PESSIMISTIC_RETRY_TIMES; i++) {
        const isUnlock =
            (await redisClient.set(redisKey, '', {
                PX: PESSIMISTIC_EXPIRE_TIME,
                NX: true
            })) === 'OK';

        if (isUnlock) {
            console.log(`Lock: ${redisKey}`);

            /* --------------------- Handle access  --------------------- */
            return (await cb()
                .catch((err) => {
                    return null;
                })
                .finally(async () => {
                    console.log(`Unlock: ${redisKey}`);
                    /* ---------------- Unlock key after finally ---------------- */
                    await redisClient.del(redisKey);
                })) as commonTypes.utils.AutoType<T>;
        } else {
            console.log('Waiting...');
            /* ---------------- Waiting until unlock  ----------------- */
            await sleep(PESSIMISTIC_WAITING_TIME);
        }
    }

    return null;
};
