import wishlistModel, { WISHLIST_MODEL_NAME } from "../models/wishlist.model.js";
import * as wishlistRepository from "../models/repository/wishlist/index.js";
import mongoose from "mongoose";
import { SKU_MODEL_NAME } from "@/models/sku.model.js";

export default new class WishListService {
    async createWishlist(userId: string, productId: string) {
        const wishlist = await wishlistRepository.createWishlist({ 
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            products: [new mongoose.Types.ObjectId(productId)]
         });

         return wishlist;
    }

    async addProductToWishlist(userId: string, productId: string) {
        const wishlist = await wishlistRepository.findOneAndUpdateWishlist({ 
            query: { user: userId, products: { $ne: productId } },
            update: { $push: { products: productId } },
            options: {
                populate: {
                    path: "products",
                    model: SKU_MODEL_NAME
                }
            }
        });

        return wishlist;
    }

    async removeProductFromWishlist(userId: string, productId: string) {
        const wishlist = await wishlistRepository.findOneAndUpdateWishlist({ 
            query: { user: userId, products: productId },
            update: { $pull: { products: productId } },
            options: {
                populate: {
                    path: "products",
                    model: SKU_MODEL_NAME
                }
            }
        });

        return wishlist;
    }

    async getWishlist(userId: string) {
        const wishlist = await wishlistRepository.findAllWishlist({ 
            query: { user: userId },
            options: {
                populate: {
                    path: "products",
                    model: SKU_MODEL_NAME
                }
            }
        });
        return wishlist;
    }

    async deleteWishlist(userId: string, productId: string) {
        const wishlist = await wishlistModel.deleteOne({ user: userId, products: productId });

        return wishlist;
    }
}