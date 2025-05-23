import { RequestWithBody, RequestWithParams, RequestWithQuery } from '@/types/request.js';
import { OkResponse } from '@/response/success.response.js';
import shopService from '@/services/shop.service.js';

export default new (class ShopController {
    /* ---------------------------------------------------------- */
    /*                       Get shop by id                       */
    /* ---------------------------------------------------------- */
    // getShopById: RequestWithParams<service.shop.arguments.GetPendingShop..> = async (req, res, _) => {
    //     const { shopId } = req.params;
    //     const shop = await shopService.getShopById(shopId);
    //     new OkResponse({
    //         message: 'Get shop by id successfully',
    //         metadata: shop
    //     }).send(res);
    // };

    /* ---------------------------------------------------------- */
    /*                    Get all pending shops                   */
    /* ---------------------------------------------------------- */
    getAllPendingShop: RequestWithQuery<service.shop.arguments.GetPendingShop> = async (
        req,
        res,
        _
    ) => {
        const { limit, page } = req.query;

        new OkResponse({
            message: 'Get all pending shop successfully',
            metadata: await shopService.getPendingShops({ limit, page })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                        Approve shop                        */
    /* ---------------------------------------------------------- */
    approveShop: RequestWithParams<service.shop.arguments.ApproveShop> = async (req, res, _) => {
        const { shopId } = req.params;

        new OkResponse({
            message: 'Approve shop successfully',
            metadata: await shopService.approveShop(shopId)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                        Reject shop                         */
    /* ---------------------------------------------------------- */
    rejectShop: RequestWithParams<service.shop.arguments.ApproveShop> = async (req, res, _) => {
        const { shopId } = req.params;

        new OkResponse({
            message: 'Reject shop successfully',
            metadata: await shopService.rejectShop(shopId)
        }).send(res);
    };
})();
