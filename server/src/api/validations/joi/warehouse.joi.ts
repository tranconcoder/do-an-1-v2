import { phoneNumber } from '@/configs/joi.config.js';
import { createLocation } from './location.joi.js';
import Joi from 'joi';

export const createWarehouse = Joi.object<joiTypes.warehouses.arguments.CreateWarehouse, true>({
    name: Joi.string().required(),
    phoneNumber,
    location: createLocation.required()
});
