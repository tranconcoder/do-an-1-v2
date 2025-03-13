import mongoose from 'mongoose';
import { phoneModel } from '../../models/product.model';
import { BadRequestErrorResponse } from '../../response/error.response';
import { get$SetNestedFromObject } from '../../utils/mongoose.util';
import {
    createPhone,
    deleteOnePhone
} from '../../models/repository/product/phoneModel.repo';
import { Product } from './product.service';

export default class Phone extends Product {
    /* ------------------- Create product ------------------- */
    public async createProduct() {
        // set id manually for product before create
        super.setProductId(new mongoose.Types.ObjectId().toString());

        return await Promise.all([
            /* ------------------- Create product ------------------- */
            super.createProduct(),

            /* ---------------- Create phone product ---------------- */
            createPhone({
                ...this.product_attributes,
                _id: super.getProductId(),
                product_shop: super.getProductShop()
            })
        ])
            .then(([product]) => product)
            .catch((error) => {
                const message = error?.messgae || 'Save product failed';
                throw new BadRequestErrorResponse(message);
            });
    }

    /* ------------------- Update product ------------------- */
    public async updateProduct() {
        const $set = {};
        get$SetNestedFromObject(this.product_attributes || {}, $set);

        return await Promise.all([
            /* ------------------- Update product ------------------- */
            super.updateProduct(),

            /* ---------------- Update phone product ---------------- */
            phoneModel.findOneAndUpdate(
                {
                    _id: super.getProductId(),
                    product_shop: super.getProductShop()
                },
                { $set },
                { new: true }
            )
        ]).then(([product]) => product);
    }

    /* ------------------- Remove product ------------------- */
    public async removeProduct() {
        return await Promise.all([
            /* ------------------- Remove product ------------------- */
            super.removeProduct(),

            /* ---------------- Remove phone product ---------------- */
            deleteOnePhone({
                _id: super.getProductId(),
                product_shop: super.getProductShop()
            })
        ]).then(([productDeletedCount, childDeletedCount]) => {
            return productDeletedCount + childDeletedCount;
        });
    }
}
