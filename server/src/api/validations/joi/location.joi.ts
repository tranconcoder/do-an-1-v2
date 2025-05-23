import Joi from 'joi';
import { mongooseId } from '@/configs/joi.config.js';

export const createLocation = Joi.object<joi.location.CreateLocation>({
    provinceId: mongooseId,
    districtId: mongooseId,
    wardId: mongooseId,
    address: Joi.string().required()
});
