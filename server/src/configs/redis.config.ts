import ms from 'ms';

export const PESSIMISTIC_EXPIRE_TIME = ms('10 seconds');
export const PESSIMISTIC_QUERY_TIME = ms('7 seconds');
export const PESSIMISTIC_WAITING_TIME = ms('30 ms');
export const PESSIMISTIC_RETRY_TIMES = ms('50 ms');

export const REDIS_CONFIG = {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379
    }
}

if (!REDIS_CONFIG.password) {
    throw new Error('REDIS_PASSWORD is not set');
}