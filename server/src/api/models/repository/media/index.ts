import mediaModel from '@/models/media.model.js';
import { generateFindOne, generateFindOneAndUpdate } from '@/utils/mongoose.util.js';

export const findOneMedia = generateFindOne<model.media.MediaSchema>(mediaModel);

export const findOneAndUpdateMedia = generateFindOneAndUpdate<model.media.MediaSchema>(mediaModel);
