/* ------------------------------------------------------ */
/*                         Delete                         */
/* ------------------------------------------------------ */
import { clothesModel } from '@/models/product.model.js';

/* ----------------- Delete one clothes ----------------- */
export const deleteOneClothes = async (payload: Partial<model.product.ClothesSchema>) => {
    const { deletedCount } = await clothesModel.deleteOne(payload);

    return deletedCount;
};
