import { NODE_ENV } from './server.config.js';

export default {
    accessToken: {
        options: {
            expiresIn: NODE_ENV === 'development' ? '1 day' : '15 minutes', // 15 minutes
            algorithm: 'RS256'
        }
    },
    refreshToken: {
        options: {
            expiresIn: '1 day', // 1 day
            algorithm: 'RS512'
        }
    }
} as service.jwt.definition.JwtConfig;
