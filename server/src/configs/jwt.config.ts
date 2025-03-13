export default {
    accessToken: {
        options: {
            expiresIn: '15 minutes', // 15 minutes
            algorithm: 'RS256'
        }
    },
    refreshToken: {
        options: {
            expiresIn: '1 day', // 1 day
            algorithm: 'RS512'
        }
    }
} as serviceTypes.jwt.definition.JwtConfig;
