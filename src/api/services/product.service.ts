import type { IntRange } from '../types/number';
import type {
    ProductAttributeType,
    ProductListKey,
    ProductListType
} from '../types/product';
import type { ClothesSchema, PhoneSchema } from '../models/product.model';
import type { HydratedDocument } from 'mongoose';

import mongoose from 'mongoose';
import productModel, {
    clothesModel,
    phoneModel
} from '../models/product.model';
import { BadRequestErrorResponse } from '../response/error.response';
import { ExtractMethodNames } from '../types/common';

/* ====================================================== */
/*                     CREATE FACTORY                     */
/* ====================================================== */
export abstract class Factory<T = any> {
    public constructor(
        public product_shop: mongoose.Types.ObjectId,
        public product_name: string,
        public product_cost: number,
        public product_thumb: string,
        public product_quantity: number,
        public product_description: string,
        public product_category: ProductListKey,
        public product_rating: IntRange<0, 6>,
        public product_attributes: T
    ) {
        this.product_shop = product_shop;
        this.product_name = product_name;
        this.product_cost = product_cost;
        this.product_thumb = product_thumb;
        this.product_quantity = product_quantity;
        this.product_description = product_description;
        this.product_category = product_category;
        this.product_rating = product_rating;
        this.product_attributes = product_attributes;
    }
    public async createProduct(): Promise<HydratedDocument<this>> {
        return (await productModel.create(
            this
        )) as any as HydratedDocument<this>;
    }

    public async removeProduct(id: string): Promise<void> {
        await productModel.deleteOne({ _id: id });
    }
}
const getService = (type: ProductListKey): ProductListType => {
    return {
        Clothes,
        Phone
    }[type];
};

/* ====================================================== */
/*                     CREATE SERVICES                    */
/* ====================================================== */
export default class ProductFactory {
    public static async createProduct<K extends ProductListKey>(
        type: K,
        payload: Omit<
            Factory<ProductAttributeType<K>>,
            ExtractMethodNames<Omit<Factory, 'product_attributes'>>
        >
    ) {
        const ServiceClass: any = getService(type);

        if (!ServiceClass) throw new Error('Invalid type');

        const instance = new ServiceClass(
            payload.product_shop,
            payload.product_name,
            payload.product_cost,
            payload.product_thumb,
            payload.product_quantity,
            payload.product_description,
            payload.product_category,
            payload.product_rating,
            payload.product_attributes
        );

        return (await instance.createProduct()) as HydratedDocument<
            typeof payload.product_attributes
        >;
    }
}

export class Phone extends Factory<PhoneSchema> {
    public async createProduct() {
        const product = await super.createProduct();
        if (!product) throw new BadRequestErrorResponse('Save product failed');

        const phone = await phoneModel.create({
            ...this.product_attributes,
            _id: product._id,
            product_shop: product.product_shop
        });
        if (!phone) throw new BadRequestErrorResponse('Save phone failed');

        return product;
    }

    public async removeProduct(id: string) {
        await Promise.all([
            super.removeProduct(id),
            phoneModel.deleteOne({ _id: id })
        ]);
    }
}

export class Clothes extends Factory<ClothesSchema> {
    public async createProduct() {
        const product = await super.createProduct();
        if (!product) throw new BadRequestErrorResponse('Save product failed');

        const clothes = await clothesModel.create({
            ...this.product_attributes,
            _id: product._id,
            product_shop: product.product_shop
        });
        if (!clothes) throw new BadRequestErrorResponse('Save clothes failed');

        return product;
    }

    public async removeProduct(id: string) {}
}

/* ====================================================== */
/*                         EXAMPLE                        */
/* ====================================================== */
// ProductFactory.createProduct('phone', {
//     product_shop: new mongoose.Types.ObjectId(),
//     product_name: 'iPhone 12',
//     product_cost: 1000,
//     product_thumb: 'iphone-12.jpg',
//     product_quantity: 10,
//     product_description:
//         'The iPhone 12 is a smartphone designed, developed, and marketed by Apple Inc. It is the fourteenth generation of the iPhone, alongside the iPhone 12 Mini, iPhone 12 Pro, and iPhone 12 Pro Max models.',
//     product_category: 'Phone',
//     product_rating: 5,
//     product_attributes: {
//         color: 'black',
//         memory: '128GB'
//     }
// }).then((x) => {
//     x.memory;
// });
