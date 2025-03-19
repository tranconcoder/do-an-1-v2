import { sleep } from 'bun';
import ms from 'ms';
import { createClient } from 'redis';
import { PessimisticKeys } from '../enums/redis.enum.js';
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

export const pessimisticLock = async <T = any>(
    key: PessimisticKeys,
    id: string,
    cb: () => Promise<T>
): Promise<(T extends infer U ? U : never) | null> => {
    const RETRY_TIMES = 10;
    const EXPIRE_TIME = ms('10 seconds');

    const redisKey = `pessLock_${key}_${id}`;

    for (let i = 0; i < RETRY_TIMES; i++) {
        const isUnlock =
            (await redisClient.set(redisKey, '', {
                PX: EXPIRE_TIME,
                NX: true
            })) !== null;

        if (isUnlock) {
            /* --------------------- Handle access  --------------------- */
            return (await cb().finally(async () => {
                await redisClient.del(redisKey);
            })) as T extends infer U ? U : never;
        } else {
            /* ---------------- Waiting until unlock  ----------------- */
            await sleep(50);
        }
    }

    return null;
};
