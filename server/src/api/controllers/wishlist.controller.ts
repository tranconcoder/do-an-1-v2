import type { RequestHandler } from "express";
import wishListService from "../services/wishlist.service.js";
import { RequestWithBody, RequestWithParams } from "@/types/request.js";
import { CreatedResponse, OkResponse } from "@/response/success.response.js";

export default new class WishListController {
    addProductToWishlist: RequestWithParams<{ productId: string }> = async (req, res, _) => {
        const userId = req.userId!;
        const productId = req.params.productId;

        const wishlist = await wishListService.addProductToWishlist(userId, productId);

        new CreatedResponse({
            message: "Add product to wishlist successfully",
            metadata: wishlist
        }).send(res);
    };

    removeProductFromWishlist: RequestWithParams<{ productId: string }> = async (req, res, _) => {
        const productId = req.params.productId;
        const userId = req.userId!;

        const wishlist = await wishListService.removeProductFromWishlist(userId, productId);

        new OkResponse({
            message: "Remove product from wishlist successfully",
            metadata: wishlist
        }).send(res);
    };

    getWishlist: RequestHandler = async (req, res, _) => {
        const userId = req.userId!;

        const wishlist = await wishListService.getWishlist(userId);

        new OkResponse({
            message: "Get wishlist successfully",
            metadata: wishlist
        }).send(res);
    }
}