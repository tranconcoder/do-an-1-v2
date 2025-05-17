import wishlistModel from "@/models/wishlist.model.js";
import * as wishlistRepository from "../models/repository/wishlist/index.js";
import { NotFoundErrorResponse } from "@/response/error.response.js";
import { spuModel } from "@/models/spu.model.js";

export default new class WishListService {
    async addProductToWishlist(userId: string, productId: string) {
        const product = await spuModel.findById(productId);
        if (!product) throw new NotFoundErrorResponse({
            message: "Product not found",
        });

        const oldWishlist = await wishlistRepository.findOneWishlist({
            query: { user: userId, products: { $in: [productId] } },
            options: {
                populate: "products",
                lean: true
            }
        });

        if (oldWishlist) return oldWishlist;

        const wishlist = await wishlistRepository.findOneAndUpdateWishlist({
            query: { user: userId, products: { $nin: [productId] } },
            update: { $push: { products: productId } },
            options: {
                populate: "products",
                new: true,
                upsert: true,
                lean: true
            }
        });

        return wishlist;
    }

    async removeProductFromWishlist(userId: string, productId: string) {
        const wishlist = await wishlistModel.updateOne({
            user: userId,
            products: { $in: [productId] }
        }, {
            $pull: { products: productId }
        });

        return await wishlistRepository.findOneWishlist({
            query: { user: userId },
            options: {
                populate: "products",
                lean: true
            }
        });
    }

    async getWishlist(userId: string) {
        const wishlist = await wishlistRepository.findAllWishlist({
            query: { user: userId },
            options: {
                populate: "products",
                lean: true
            }
        });
        return wishlist;
    }
}