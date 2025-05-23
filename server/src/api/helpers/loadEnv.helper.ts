import dotenv from 'dotenv';
import path from 'path';

const NODE_ENV = process.env.NODE_ENV || 'development';
const envPath = path.join(import.meta.dirname, `../../../.env.${NODE_ENV}.local`);

dotenv.config({
    path: envPath,
    override: true
});
