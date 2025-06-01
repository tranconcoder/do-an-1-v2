import { OkResponse } from "@/response/success.response.js";
import skuService from "@/services/sku.service.js";
import { RequestWithParams, RequestWithQuery } from "@/types/request.js";
import type { GetAllSKUQuery } from "@/validations/zod/sku.zod.js";

export default new (class SKUController {

    /* ---------------------------------------------------------- */
    /*                       Get SKU popular                      */
    /* ---------------------------------------------------------- */
    getPopularSKUByAll: RequestWithQuery<commonTypes.object.Pagination> = async (req, res, _) => {
        new OkResponse({
            message: 'Get popular sku by all successfully!',
            metadata: await skuService.getPopularSKUByAll({
                page: Number(req.query.page),
                limit: Number(req.query.limit)
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                        Get SKU by id                       */
    /* ---------------------------------------------------------- */
    getSKUById: RequestWithParams<service.sku.arguments.GetSKUById> = async (req, res, _) => {
        new OkResponse({
            message: 'Get sku by id successfully!',
            metadata: await skuService.getSKUById({ skuId: req.params.skuId })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                     Get SKU shop by all                    */
    /* ---------------------------------------------------------- */
    getAllSKUShopByAll: RequestWithQuery<commonTypes.object.Pagination> = async (req, res, _) => {
        new OkResponse({
            message: 'Get all sku by shop successfully!',
            metadata: await skuService.getAllShopSKUByAll({
                page: req.query.page,
                limit: req.query.limit,
                shopId: req.params.shopId
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                     Get all SKU by all                     */
    /* ---------------------------------------------------------- */
    getAllSKUByAll: RequestWithQuery<GetAllSKUQuery> = async (req, res, _) => {
        // Query parameters are already validated by middleware
        const validatedQuery = req.query;

        // Parse categories from comma-separated string to array
        const categoriesArray = validatedQuery.categories
            ? validatedQuery.categories.split(',').filter(id => id.trim() !== '')
            : undefined;

        new OkResponse({
            message: 'Get all sku by all successfully!',
            metadata: await skuService.getAllSKUByAll({
                ...validatedQuery,
                categories: categoriesArray
            })
        }).send(res);
    };
})();