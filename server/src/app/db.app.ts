// Libs
import mongoose, { MongooseError } from 'mongoose';

// Services
import LoggerService from '@/services/logger.service.js';

// Configs
import { DB_URL, DB_MIN_POOL_SIZE, DB_MAX_POOL_SIZE, NODE_ENV } from '@/configs/server.config.js';

export default class MongoDB {
    private static instance: MongoDB;

    private constructor() {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected');
        });

        mongoose.connection.on('closed', () => {
            console.log('MongoDB connection closed');
        });

        mongoose.connection.on('error', (error: MongooseError) => {
            if (NODE_ENV === 'production') {
                LoggerService.getInstance().error(`${error.name}: ${error.message}`);
            }

            console.log('MongoDB error: \n', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
    }

    public connect = async () => {
        await mongoose.connect(DB_URL, {
            minPoolSize: DB_MIN_POOL_SIZE,
            maxPoolSize: DB_MAX_POOL_SIZE
        });
    };

    public disconnect = () => {
        mongoose.disconnect();
    };

    public static getInstance = () => {
        if (!this.instance) {
            this.instance = new MongoDB();
        }

        return this.instance;
    };
}
