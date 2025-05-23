import wishlistModel from "@/models/wishlist.model.js";
import { generateFindAll, generateFindOne, generateFindOneAndUpdate } from "@/utils/mongoose.util.js";

export const findAllWishlist = generateFindAll<model.wishlist.Wishlist>(wishlistModel);

export const findOneWishlist = generateFindOne<model.wishlist.Wishlist>(wishlistModel);

export const findOneAndUpdateWishlist = generateFindOneAndUpdate<model.wishlist.Wishlist>(wishlistModel);

/* -------------------- Create -------------------- */
export const createWishlist = async (wishlist: model.wishlist.Wishlist) => {
    const newWishlist = await wishlistModel.create(wishlist);

    return newWishlist;
}