import Joi from "joi";
import { mongooseId } from "@/configs/joi.config.js";

export const createLocation = Joi.object<joi.location.CreateLocation>({
    provinceId: mongooseId,
    cityId: mongooseId,
    districtId: mongooseId,
    address: Joi.string().required()
})
