
/* ------------------------------------------------------ */
/*                         Delete                         */
/* ------------------------------------------------------ */
import { clothesModel } from '../../product.model';

/* ----------------- Delete one clothes ----------------- */
export const deleteOneClothes = async (
    payload: Partial<modelTypes.product.ClothesSchema>
) => {
    const { deletedCount } = await clothesModel.deleteOne(payload);

    return deletedCount;
};
