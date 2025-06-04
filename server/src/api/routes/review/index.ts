import { validateParamsId } from '@/configs/joi.config';
import reviewController from '@/controllers/review.controller';
import catchError from '@/middlewares/catchError.middleware';
import { authenticate } from '@/middlewares/jwt.middleware';
import { validateCreateReview } from '@/validations/zod/review.zod';
import { Router } from 'express';

const reviewRoute = Router();
reviewRoute.use(authenticate);

/* ----------------------- Create review ----------------------- */
reviewRoute.post(
    "/create",
    validateCreateReview,
    catchError(reviewController.createReview)
);

/* ------------------ Get reviews by order ------------------ */
reviewRoute.get(
    "/order/:orderId",
    validateParamsId("orderId"),
    catchError(reviewController.getReviewsByOrderId)
);

/* ------------------ Get last review by SKU ------------------ */
reviewRoute.get(
    "/sku/:skuId",
    validateParamsId("skuId"),
    catchError(reviewController.getLastReviewBySkuId)
);

/* ------------------ Get reviews by SKU with statistics ------------------ */
reviewRoute.get(
    "/sku/:skuId/all",
    validateParamsId("skuId"),
    catchError(reviewController.getReviewsBySkuId)
);

export default reviewRoute;