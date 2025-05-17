import wishlistController from "@/controllers/wishlist.controller.js";
import catchError from "@/middlewares/catchError.middleware.js";
import { authenticate } from "@/middlewares/jwt.middleware.js";
import { Router } from "express";

const wishListRouter = Router();
wishListRouter.use(authenticate)

wishListRouter.post("/add/:productId", catchError(wishlistController.addProductToWishlist));
wishListRouter.post("/remove/:productId", catchError(wishlistController.removeProductFromWishlist));
wishListRouter.get("/", catchError(wishlistController.getWishlist));


export default wishListRouter;