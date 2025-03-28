import { phoneModel } from '@/models/product.model.js';

/* ------------------------------------------------------ */
/*                         Create                         */
/* ------------------------------------------------------ */
/* -------------------- Create phone -------------------- */
export const createPhone = async (
    payload: Partial<moduleTypes.mongoose.ConvertObjectIdToString<model.product.PhoneSchema>>
) => {
    return await phoneModel.create(payload);
};

/* ------------------------------------------------------ */
/*                         Delete                         */
/* ------------------------------------------------------ */
/* ------------------ Delete one phone ------------------ */
export const deleteOnePhone = async (query: Partial<model.product.PhoneSchema>) => {
    const result = await phoneModel.deleteOne(query);

    return result.deletedCount;
};
