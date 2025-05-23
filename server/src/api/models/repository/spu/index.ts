import { spuModel } from '@/models/spu.model.js';
import {
    generateFindAll,
    generateFindAllPaganation,
    generateFindById,
    generateFindByIdAndDelete,
    generateFindByIdAndUpdate,
    generateFindOne,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
export const findSPUById = generateFindById<model.spu.SPUSchema>(spuModel);

export const findOneSPU = generateFindOne<model.spu.SPUSchema>(spuModel);

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */
export const findSPU = generateFindAll<model.spu.SPUSchema>(spuModel);

export const findSPUPageSpliting = generateFindAllPaganation<model.spu.SPUSchema>(spuModel);

export const findAllSPUIds = async () => {
    return findSPU({
        query: {},
        projection: { _id: 1 },
        options: { lean: true }
    }).then((spus) => spus.map((spu) => spu._id));
};

/* --------------- Get all with page splitting -------------- */
export const findSpuPageSpliting = generateFindAllPaganation<model.spu.SPUSchema>(spuModel);

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
export const findByIdAndUpdateSPU = generateFindByIdAndUpdate<model.spu.SPUSchema>(spuModel);

export const findOneAndUpdateSPU = generateFindOneAndUpdate<model.spu.SPUSchema>(spuModel);

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
export const findByIdAndDeleteSPU = generateFindByIdAndDelete<model.spu.SPUSchema>(spuModel);