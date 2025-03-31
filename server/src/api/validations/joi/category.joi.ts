import { mongooseId } from '@/configs/joi.config.js';
import Joi from 'joi';
import _ from 'lodash';

const category = {
    category_name: Joi.string().optional(),
    category_description: Joi.string().optional(),
    category_order: Joi.number().optional(),
    category_parent: mongooseId.optional()
};

export const updateCategory = Joi.object<joiTypes.category.UpdateCategory>({
    /* --------------------- Optional value --------------------- */
    ..._.mapValues(
        _.pick(category, [
            'category_name',
            'category_description',
            'category_order',
            'category_parent'
        ]),
        (value) => value.optional()
    )
});
