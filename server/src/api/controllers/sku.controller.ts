import { OkResponse } from "@/response/success.response.js";
import skuService from "@/services/sku.service.js";
import { RequestWithQuery } from "@/types/request.js";

export default new class SKUController {
    /* ---------------------------------------------------------- */
    /*                     Get SKU shop by all                    */
    /* ---------------------------------------------------------- */
    getAllSKUShopByAll: RequestWithQuery<commonTypes.object.PageSlitting> = async (req, res, _) => {
        new OkResponse({
            message: 'Get all sku by shop successfully!',
            metadata: await skuService.getAllShopSKUByAll({
                page: req.query.page,
                limit: req.query.limit,
                shopId: req.params.shopId
            })
        }).send(res);
    };
}