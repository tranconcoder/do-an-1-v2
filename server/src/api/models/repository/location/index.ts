import {
    generateFindAllPageSplit,
    generateFindOne,
    generateFindById,
    generateFindAll,
} from '@/utils/mongoose.util.js';
import { cityModel, districtModel, locationModel, provinceModel } from '@/models/location.model.js';



/* ---------------------------------------------------------- */
/*                           Utils                            */
/* ---------------------------------------------------------- */

/* ------------------------ Find all ------------------------ */
export const findLocation = generateFindAll<model.location.LocationSchema>(locationModel);

export const findProvince = generateFindAll<model.location.Province>(provinceModel);

export const findCity = generateFindAll<model.location.City>(cityModel);

export const findDistrict = generateFindAll<model.location.District>(districtModel);



/* ------------------------ Find one ------------------------ */
export const findOneLocation = generateFindOne<model.location.LocationSchema>(locationModel);

export const findOneProvince = generateFindOne<model.location.Province>(provinceModel);

export const findOneCity = generateFindOne<model.location.City<false, true>>(cityModel);

export const findOneDistrict = generateFindOne<model.location.District>(districtModel);

