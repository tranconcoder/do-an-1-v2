import { sleep } from '../utils/promise.util.js';
import { createClient } from 'redis';
import { PessimisticKeys } from '../enums/redis.enum.js';
import LoggerService from './logger.service.js';
import {
    PESSIMISTIC_EXPIRE_TIME,
    PESSIMISTIC_RETRY_TIMES,
    PESSIMISTIC_WAITING_TIME,
    REDIS_CONFIG
} from '@/configs/redis.config.js';
import {
    getKeyTokenKey,
    getKeyTokenRefreshTokenUsedKey,
    getPessimisticKey,
    getUserProfileKey
} from '@/utils/redis.util.js';


/* ---------------------------------------------------------- */
/*                         Init client                        */
/* ---------------------------------------------------------- */
const redisClient = await createClient({
    username: REDIS_CONFIG.username,
    password: REDIS_CONFIG.password,
    socket: REDIS_CONFIG.socket
})
    .on('error', (err) => {
        const message = `Redis error: ${err}`;

        LoggerService.getInstance().error(message);
    })
    .on('connect', () => {
        console.log('Redis connected!');
    })
    .connect();

/* ---------------------------------------------------------- */
/*                    Concurrency handling                    */
/* ---------------------------------------------------------- */
export const pessimisticLock = async <T = any>(
    key: PessimisticKeys,
    id: string,
    cb: () => Promise<T>
): Promise<commonTypes.utils.AutoType<T> | null> => {
    const redisKey = getPessimisticKey(key, id);

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
                .catch(() => {
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

async function hGetRedis(key: string) {
    const result = await redisClient.hGetAll(key);
    if (!Object.keys(result).length) return null;

    return result;
}

/* ---------------------------------------------------------- */
/*                            User                            */
/* ---------------------------------------------------------- */

/* -------------------- Get user profile -------------------- */
export const getUserProfile = async (id: string) => {
    const result: any = await hGetRedis(getUserProfileKey(id));

    if (result) {
        result.user_sex = result.user_sex === "1";
    }

    return result;
};

/* -------------------- Set user profile -------------------- */
export const setUserProfile = async ({
    _id,
    user_fullName,
    user_email,
    phoneNumber,
    user_role,
    user_avatar,
    user_sex,
    user_status,
    user_dayOfBirth
}: service.redis.SetUserProfile) => {
    const data = {
        _id,
        user_fullName,
        user_email,
        phoneNumber,
        user_role: user_role.toString(),
        user_avatar,
        user_sex: user_sex ? "1" : "0",
        user_status: user_status!,
        user_dayOfBirth: user_dayOfBirth?.toISOString() || "",
    }

    await redisClient.hSet(getUserProfileKey(_id), data);
};

/* -------------------- Delete user profile -------------------- */
export const deleteUserProfile = async (id: string) => {
    await redisClient.del(getUserProfileKey(id));
};

/* ---------------------------------------------------------- */
/*                          Key token                         */
/* ---------------------------------------------------------- */

/* ---------------------- Get key token  --------------------- */
export const getKeyToken = async (id: string): Promise<model.keyToken.KeyTokenSchema> => {
    return (await hGetRedis(getKeyTokenKey(id))) as any;
};

/* ---------------------- Set key token  --------------------- */
export const setKeyToken = async ({
    user,
    public_key,
    private_key,
    refresh_token,
    refresh_tokens_used = []
}: moduleTypes.mongoose.ConvertObjectIdToString<model.keyToken.KeyTokenSchema>) => {
    const id = user;

    const cmd = redisClient.multi();

    cmd.hSet(getKeyTokenKey(id), { user, public_key, private_key, refresh_token });

    cmd.del(getKeyTokenRefreshTokenUsedKey(id));
    if (refresh_tokens_used.length > 0) {
        cmd.rPush(getKeyTokenRefreshTokenUsedKey(id), refresh_tokens_used);
    }

    await cmd.exec();
};

/* -------------------- Delete key token -------------------- */
export const deleteKeyToken = async (userId: string) => {
    const id = userId;

    return await redisClient.DEL([getKeyTokenKey(id), getKeyTokenRefreshTokenUsedKey(id)]);
};
