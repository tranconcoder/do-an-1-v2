import { RequestWithParams, RequestWithBody } from '@/types/common.type.js';
import { OkResponse } from '@/response/success.response.js';
import productService from '@/services/product.service.js';

export default new (class ProductController {
    /* ----------------------- Get Product for Edit ----------------------- */
    getProductForEdit: RequestWithParams<{ productId: string }> = async (req, res, next) => {
        res.status(200).json(
            new OkResponse({
                message: 'Product data retrieved successfully',
                metadata: await productService.getProductForEdit({
                    productId: req.params.productId,
                    userId: req.user.user_id
                })
            })
        );
    };

    /* ----------------------- Update Product Info ----------------------- */
    updateProductInfo: RequestWithParams<{ productId: string }> & RequestWithBody<any> = async (req, res, next) => {
        res.status(200).json(
            new OkResponse({
                message: 'Product information updated successfully',
                metadata: await productService.updateProductInfo({
                    productId: req.params.productId,
                    userId: req.user.user_id,
                    ...req.body
                })
            })
        );
    };

    /* ----------------------- Update Product Media ----------------------- */
    updateProductMedia: RequestWithParams<{ productId: string }> & RequestWithBody<any> = async (req, res, next) => {
        res.status(200).json(
            new OkResponse({
                message: 'Product media updated successfully',
                metadata: await productService.updateProductMedia({
                    productId: req.params.productId,
                    userId: req.user.user_id,
                    mediaIds: req.mediaIds,
                    ...req.body
                })
            })
        );
    };

    /* ----------------------- Delete Product Media ----------------------- */
    deleteProductMedia: RequestWithParams<{ productId: string }> & RequestWithBody<any> = async (req, res, next) => {
        res.status(200).json(
            new OkResponse({
                message: 'Product media deleted successfully',
                metadata: await productService.deleteProductMedia({
                    productId: req.params.productId,
                    userId: req.user.user_id,
                    ...req.body
                })
            })
        );
    };

    /* ----------------------- Update SKU ----------------------- */
    updateSKU: RequestWithParams<{ skuId: string }> & RequestWithBody<any> = async (req, res, next) => {
        res.status(200).json(
            new OkResponse({
                message: 'SKU updated successfully',
                metadata: await productService.updateSKU({
                    skuId: req.params.skuId,
                    userId: req.user.user_id,
                    ...req.body
                })
            })
        );
    };

    /* ----------------------- Create SKU ----------------------- */
    createSKU: RequestWithParams<{ productId: string }> & RequestWithBody<any> = async (req, res, next) => {
        res.status(200).json(
            new OkResponse({
                message: 'SKU created successfully',
                metadata: await productService.createSKU({
                    productId: req.params.productId,
                    userId: req.user.user_id,
                    mediaIds: req.mediaIds,
                    ...req.body
                })
            })
        );
    };

    /* ----------------------- Delete SKU ----------------------- */
    deleteSKU: RequestWithParams<{ skuId: string }> = async (req, res, next) => {
        res.status(200).json(
            new OkResponse({
                message: 'SKU deleted successfully',
                metadata: await productService.deleteSKU({
                    skuId: req.params.skuId,
                    userId: req.user.user_id
                })
            })
        );
    };
})(); 