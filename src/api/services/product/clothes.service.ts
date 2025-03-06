import mongoose from 'mongoose';
import { Product } from '.';
import { clothesModel } from '../../models/product.model';
import { BadRequestErrorResponse } from '../../response/error.response';
import { get$SetNestedFromObject } from '../../utils/mongoose.util';

export default class Clothes extends Product {
    /* ------------------- Create product ------------------- */
    public async createProduct() {
        // set id manually for product before create
        super.setProductId(new mongoose.Types.ObjectId().toString());

        return await Promise.all([
            super.createProduct(),
            clothesModel.create({
                ...this.product_attributes,
                _id: super.getProductId(),
                product_shop: super.getProductShop()
            })
        ])
            .then(([product]) => product)
            .catch(() => {
                throw new BadRequestErrorResponse('Save product failed');
            });
    }

    /* ------------------- Update product ------------------- */
    public async updateProduct() {
        const $set = {};
        get$SetNestedFromObject(this.product_attributes || {}, $set);

        return await Promise.all([
            super.updateProduct(),
            clothesModel.updateOne({ _id: super.getProductId() }, { $set })
        ]).then(([product]) => product);
    }

    /* ------------------- Remove product ------------------- */
    public async removeProduct() {
        await Promise.all([
            super.removeProduct(),
            clothesModel.deleteOne({ _id: super.getProductId() })
        ]);
    }
}
