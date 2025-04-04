import { spuModel } from '@/models/spu.model.js';
import {
    generateFindAll,
    generateFindAllPageSplit,
    generateFindById
} from '@/utils/mongoose.util.js';

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
export const findSPUById = generateFindById<model.spu.SPUSchema>(spuModel);

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */
export const findAllSPU = generateFindAll<model.spu.SPUSchema>(spuModel);

export const findAllSPUIds = async () => {
    return findAllSPU({
        query: {},
        projection: { _id: 1 },
        options: { lean: true }
    }).then((spus) => spus.map((spu) => spu._id));
};

/* --------------- Get all with page splitting -------------- */
export const findSkuPageSpliting = generateFindAllPageSplit<model.spu.SPUSchema>(spuModel);