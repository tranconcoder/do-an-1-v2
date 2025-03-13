import mongoose from 'mongoose';
import { Product } from './product.service';
import { clothesModel } from '../../models/product.model';
import { BadRequestErrorResponse } from '../../response/error.response';
import { get$SetNestedFromObject } from '../../utils/mongoose.util';
import { deleteOneClothes } from '../../models/repository/product/clothesModel.repo';

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
            clothesModel.findOneAndUpdate(
                { _id: super.getProductId() },
                { $set },
                { new: true }
            )
        ]).then(([product]) => product);
    }

    /* ------------------- Remove product ------------------- */
    public async removeProduct() {
        return await Promise.all([
            super.removeProduct(),

            deleteOneClothes({
                _id: super.getProductId(),
                product_shop: super.getProductShop()
            })
        ]).then(([productDeletedCount, childDeletedCount]) => {
            return productDeletedCount + childDeletedCount;
        });
    }
}
