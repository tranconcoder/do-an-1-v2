import { PreSaveMiddlewareFunction } from 'mongoose';
import slugify from 'slugify';

export const addSlug: PreSaveMiddlewareFunction<modelTypes.product.ProductSchema> =
    function (next) {
        this.product_slug = slugify(this.product_name, {
            lower: true,
            trim: true,
            locale: 'vi'
        });

        next();
    };
