import { PessimisticKeys } from '@/enums/redis.enum.js';

/* ---------------------------------------------------------- */
/*                        PESSIMISTIC                         */
/* ---------------------------------------------------------- */
export const getPessimisticKey = (key: PessimisticKeys, id: string) => `pessLock_${key}_${id}`;

export const getUserProfileKey = (id: string) => `user:${id}:profile`;

/* ---------------------------------------------------------- */
/*                            Cache                           */
/* ---------------------------------------------------------- */
/* ------------------------ Key token ----------------------- */
export const getKeyTokenKey = (id: string) => `user:${id}:keyToken`;
export const getKeyTokenRefreshTokenUsedKey = (id: string) =>
    `user:${id}:keyToken_refreshTokenUsed`;
