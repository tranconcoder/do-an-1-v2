import wishlistController from "@/controllers/wishlist.controller.js";
import catchError from "@/middlewares/catchError.middleware.js";
import { authenticate } from "@/middlewares/jwt.middleware.js";
import { Router } from "express";

const wishListRouter = Router();
wishListRouter.use(authenticate)

wishListRouter.get("/", catchError(wishlistController.getWishlist));
wishListRouter.post("/add/:productId", catchError(wishlistController.addProductToWishlist));
wishListRouter.delete("/remove/:productId", catchError(wishlistController.removeProductFromWishlist));


export default wishListRouter;