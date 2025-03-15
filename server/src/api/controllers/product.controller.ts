import { RequestHandler } from 'express';
import { ITEM_PER_PAGE } from 'src/configs/server.config';
import SuccessResponse, { CreatedResponse } from '../response/success.response';
import ProductFactory from '../services/product';
import { RequestWithBody, RequestWithParams, RequestWithQuery } from '../types/request';

export default class ProductController {
    /* ------------------------------------------------------ */
    /*                     Create product                     */
    /* ------------------------------------------------------ */
    public static createProduct: RequestWithBody<joiTypes.product.definition.CreateProductSchema> =
        async (req, res, _) => {
            new CreatedResponse({
                message: 'Product created successfully',
                metadata: await ProductFactory.createProduct(req.body.product_category, {
                    ...req.body,
                    product_shop: req.userId as string
                })
            }).send(res);
        };

    /* ------------------------------------------------------ */
    /*                         Search                         */
    /* ------------------------------------------------------ */
    public static searchProduct: RequestWithQuery<serviceTypes.product.arguments.SearchProduct> =
        async (req, res, _) => {
            new SuccessResponse({
                name: 'Search product',
                message: 'Search product success',
                statusCode: 200,
                metadata: await ProductFactory.searchProduct({
                    page: Number(req.query.page),
                    query: req.query.query
                })
            }).send(res);
        };

    /* ------------------------------------------------------ */
    /*                      Get product                       */
    /* ------------------------------------------------------ */
    /* ----------------- Get product by id  ----------------- */
    public static getProductById: RequestWithParams<serviceTypes.product.arguments.GetProductById> =
        async (req, res, _) => {
            new SuccessResponse({
                name: 'Get product by id',
                message: 'Get product by id success',
                statusCode: 200,
                metadata: await ProductFactory.getProductById({
                    productId: req.params.productId,
                    userId: req.userId
                })
            }).send(res);
        };

    /* --------------- Get all product by shop -------------- */
    public static getAllProductByShop: RequestHandler<
        joiTypes.product.definition.GetAllProductByShopParams,
        any,
        any,
        joiTypes.product.definition.GetAllProductByShopQuery
    > = async (req, res, _) => {
        console.log(req.query);
        new SuccessResponse({
            name: 'Get product shop',
            message: 'Get product shop success',
            statusCode: 200,
            metadata: await ProductFactory.getAllProductByShop({
                product_shop: req.params.shopId,
                limit: req.query.limit || ITEM_PER_PAGE,
                page: req.query.page || 1,
                userId: req.userId as string
            })
        }).send(res);
    };

    /* ------------- Get all product draft by shop  ------------- */
    public static getAllProductDraftByShop: RequestWithQuery<joiTypes.product.definition.GetAllProductDraftByShopSchema> =
        async (req, res, _) => {
            new SuccessResponse({
                name: 'Get all product draft by shop',
                message: 'Get all product draft by shop success',
                statusCode: 200,
                metadata: await ProductFactory.getAllProductDraftByShop({
                    product_shop: req.userId as string,
                    limit: req.query.limit || ITEM_PER_PAGE,
                    page: req.query.page || 1
                })
            }).send(res);
        };

    /* ------------ Get all product publish by shop  ------------ */
    public static getAllProductPublishByShop: RequestWithQuery<joiTypes.product.definition.GetAllProductPublishByShopSchema> =
        async (req, res, _) => {
            new SuccessResponse({
                name: 'Get all product publish by shop',
                message: 'Get all product publish by shop success',
                statusCode: 200,
                metadata: await ProductFactory.getAllProductPublishByShop({
                    product_shop: req.userId as string,
                    limit: req.query.limit || ITEM_PER_PAGE,
                    page: req.query.page || 1
                })
            }).send(res);
        };

    /* ------------ Get all product undraft by shop  ------------ */
    public static getAllProductUndraftByShop: RequestWithQuery<joiTypes.product.definition.GetAllProductUndraftByShopSchema> =
        async (req, res, _) => {
            new SuccessResponse({
                name: 'Get all product undraft by shop',
                message: 'Get all product undraft by shop success',
                statusCode: 200,
                metadata: await ProductFactory.getAllProductUndraftByShop({
                    product_shop: req.userId as string,
                    limit: req.query.limit || ITEM_PER_PAGE,
                    page: req.query.page || 1
                })
            }).send(res);
        };

    /* ----------- Get all product unpublish by shop  ----------- */
    public static getAllProductUnpublishByShop: RequestWithQuery<joiTypes.product.definition.GetAllProductUnpublishByShopSchema> =
        async (req, res, _) => {
            new SuccessResponse({
                name: 'Get all product unpublish by shop',
                message: 'Get all product unpublish by shop success',
                statusCode: 200,
                metadata: await ProductFactory.getAllProductUnpublishByShop({
                    product_shop: req.userId as string,
                    limit: req.query.limit || ITEM_PER_PAGE,
                    page: req.query.page || 1
                })
            }).send(res);
        };

    /* ------------------------------------------------------ */
    /*                     Update product                     */
    /* ------------------------------------------------------ */
    /* ------------------- Update product ------------------- */
    public static updateProduct: RequestWithBody<serviceTypes.product.arguments.UpdateProduct> =
        async (req, res, _) => {
            new SuccessResponse({
                name: 'Update product',
                statusCode: 200,
                message: 'Update product success',
                metadata:
                    (await ProductFactory.updateProduct({
                        ...req.body,
                        product_shop: req.userId as string
                    })) || {}
            }).send(res);
        };

    /* ----------------- Set draft product  ----------------- */
    public static setDraftProduct: RequestWithBody<joiTypes.product.definition.SetDraftProductSchema> =
        async (req, res, _) => {
            new SuccessResponse({
                name: 'Set draft product',
                message: 'Set draft product success',
                statusCode: 200,
                metadata: {
                    setDraftSuccess: await ProductFactory.setDraftProduct({
                        product_id: req.params.product_id,
                        product_shop: req.userId as string
                    })
                }
            }).send(res);
        };

    /* ---------------- Set publish product  ---------------- */
    public static setPublishProduct: RequestWithBody<joiTypes.product.definition.SetPublishProductSchema> =
        async (req, res, _) => {
            new SuccessResponse({
                name: 'Set publish product',
                message: 'Set publish product success',
                statusCode: 200,
                metadata: {
                    setPublishSuccess: await ProductFactory.setPublishProduct({
                        product_id: req.params.product_id,
                        product_shop: req.userId as string
                    })
                }
            }).send(res);
        };

    /* ------------------------------------------------------ */
    /*                     Delete product                     */
    /* ------------------------------------------------------ */
    public static deleteProduct: RequestWithBody<joiTypes.product.definition.DeleteProductSchema> =
        async (req, res, _) => {
            await ProductFactory.removeProduct(req.body.product_id, req.userId as string);

            new SuccessResponse({
                message: 'Product deleted successfully',
                name: 'Delete product',
                statusCode: 200
            }).send(res);
        };
}
