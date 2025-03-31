import { spuModel } from '@/models/spu.model.js';
import { generateFindById } from '@/utils/mongoose.util.js';

export const findSPUById = generateFindById<model.spu.SPUSchema>(spuModel);
