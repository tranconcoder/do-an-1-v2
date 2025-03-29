import mediaModel from '@/models/media.model.js';
import {
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';

/* ------------------------ Find one ------------------------ */
export const findOneMedia = generateFindOne<model.media.MediaSchema>(mediaModel);

/* ----------------------- Find by id ----------------------- */
export const findMediaById = generateFindById<model.media.MediaSchema>(mediaModel);

/* ------------------ Find one and update  ------------------ */
export const findOneAndUpdateMedia = generateFindOneAndUpdate<model.media.MediaSchema>(mediaModel);

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
/* ------------------- Change media ower  ------------------- */
export const changeMediaOwner = async ({
    mediaId,
    userId
}: repo.media.arguments.ChangeMediaOwner) => {
    return await findOneAndUpdateMedia({
        query: { _id: mediaId },
        update: { media_owner: userId },
        options: { new: true }
    });
};
