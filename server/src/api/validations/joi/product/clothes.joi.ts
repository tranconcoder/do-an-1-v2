import Joi from 'joi';

/* ====================================================== */
/*                     CREATE CLOUTHES                    */
/* ====================================================== */
export const createClothesSchema = Joi.object<
    joiTypes.product.definition.CreateClothesSchema,
    true
>({
    size: Joi.string().required(),
    color: Joi.string().required()
});

/* ====================================================== */
/*                     UPDATE CLOTHES                     */
/* ====================================================== */
export const updateClothesSchema = Joi.object<
    joiTypes.product.definition.UpdateClothesSchema,
    true
>({
    size: Joi.string(),
    color: Joi.string()
});
