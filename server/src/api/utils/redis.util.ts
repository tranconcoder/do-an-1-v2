import { PessimisticKeys } from '@/enums/redis.enum.js';

/* ---------------------------------------------------------- */
/*                        PESSIMISTIC                         */
/* ---------------------------------------------------------- */
export const getPessimisticKey = (key: PessimisticKeys, id: string) => `pessLock_${key}_${id}`;

export const getUserProfileKey = (id: string) => `user:${id}:profile`;
export const getUserProfileFieldKey = (id: string, field: string) => `user:${id}:profile:${field}`;
