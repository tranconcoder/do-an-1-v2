import {
    generateFindAllPaganation,
    generateFindOne,
    generateFindById,
    generateFindAll
} from '@/utils/mongoose.util.js';
import { districtModel, wardModel, locationModel, provinceModel } from '@/models/location.model.js';

/* ---------------------------------------------------------- */
/*                           Utils                            */
/* ---------------------------------------------------------- */

/* ------------------------ Find all ------------------------ */
export const findLocation = generateFindAll<model.location.LocationSchema>(locationModel);

export const findProvince = generateFindAll<model.location.Province>(provinceModel);

export const findDistrict = generateFindAll<model.location.District>(districtModel);

export const findWard = generateFindAll<model.location.Ward>(wardModel);

/* ------------------------ Find one ------------------------ */
export const findLocationById = generateFindById<model.location.LocationSchema>(locationModel);

export const findOneLocation = generateFindOne<model.location.LocationSchema>(locationModel);

export const findOneProvince = generateFindOne<model.location.Province>(provinceModel);

export const findOneDistrict = generateFindOne<model.location.District<false, true>>(districtModel);

export const findOneWard = generateFindOne<model.location.Ward>(wardModel);
