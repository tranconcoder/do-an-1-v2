import { findOrderById } from "@/models/repository/order";
import { BadRequestErrorResponse, NotFoundErrorResponse } from "@/response/error.response";
import { CreateReviewSchema } from "@/validations/zod/review.zod";
import { OrderStatus } from "@/enums/order.enum";
import { findOneReview } from "@/models/repository/review";
import reviewModel from "@/models/review.model";
import { findReview } from "@/models/repository/review";

export default new class ReviewService {
    /* ---------------------------------------------------------- */
    /*                        Create review                       */
    /* ---------------------------------------------------------- */
    async createReview(userId: string, payload: CreateReviewSchema) {
        const { order_id, sku_id, review_content, review_rating, review_images } = payload;

        /* ----------------------- Check review exist ---------------------- */
        const existingReview = await findOneReview({ query: { order_id, sku_id } });
        if (existingReview) throw new BadRequestErrorResponse({ message: 'Review already exists for this product in this order' });

        /* ----------------------- Check order ---------------------- */
        const order = await findOrderById({ id: order_id });
        if (!order) throw new NotFoundErrorResponse({ message: 'Order not found' });

        /* ----------------------- Check order status ---------------------- */
        if (order.order_status !== OrderStatus.COMPLETED) throw new BadRequestErrorResponse({ message: 'Order is not completed' });

        /* ----------------------- Check customer ---------------------- */
        if (order.customer.toString() !== userId)
            throw new BadRequestErrorResponse({ message: 'You are not the customer of this order' });

        /* ----------------------- Check sku ---------------------- */
        const skuIndex = order.products_info.findIndex(product => product.sku_id.toString() === sku_id);
        if (skuIndex === -1) throw new BadRequestErrorResponse({ message: 'SKU not found in order' });

        /* ----------------------- Check review ---------------------- */
        const review = await reviewModel.create({
            user_id: userId,
            order_id,
            shop_id: order.shop_id,
            sku_id,
            review_content,
            review_rating,
            review_images,
        });

        return review;
    }

    /* ---------------------------------------------------------- */
    /*                    Get reviews by ORDER                    */
    /* ---------------------------------------------------------- */
    async getReviewsByOrderId(orderId: string, userId: string) {
        return await findReview({ query: { order_id: orderId, user_id: userId } });
    }

    /* ---------------------------------------------------------- */
    /*                   Get last review by SKU                   */
    /* ---------------------------------------------------------- */
    async getLastReviewBySkuId(skuId: string, userId: string) {
        return await findOneReview({ query: { sku_id: skuId, user_id: userId }, options: { sort: { createdAt: -1 } } });
    }

    /* ---------------------------------------------------------- */
    /*              Get reviews by SKU with statistics            */
    /* ---------------------------------------------------------- */
    async getReviewsBySkuId(skuId: string) {
        // Get all reviews for this SKU
        const reviews = await findReview({
            query: { sku_id: skuId },
            options: {
                sort: { createdAt: -1 },
                populate: [
                    { path: 'user_id', select: 'user_fullName user_avatar' },
                    { path: 'review_images' }
                ]
            }
        });

        // Calculate statistics
        const totalReviews = reviews.length;
        let averageRating = 0;
        const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (totalReviews > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.review_rating, 0);
            averageRating = Math.round((totalRating / totalReviews) * 10) / 10; // Round to 1 decimal place

            // Count ratings breakdown
            reviews.forEach(review => {
                ratingBreakdown[review.review_rating as keyof typeof ratingBreakdown]++;
            });
        }

        return {
            reviews,
            statistics: {
                totalReviews,
                averageRating,
                ratingBreakdown
            }
        };
    }

    /* ---------------------------------------------------------- */
    /*              Get reviews by Shop with pagination           */
    /* ---------------------------------------------------------- */
    async getReviewsByShopId(shopId: string, options: {
        page?: number;
        limit?: number;
        rating?: number;
        sortBy?: 'createdAt' | 'review_rating';
        sortType?: 'asc' | 'desc';
    } = {}) {
        const {
            page = 1,
            limit = 10,
            rating,
            sortBy = 'createdAt',
            sortType = 'desc'
        } = options;

        // Build query
        const query: any = { shop_id: shopId };
        if (rating) {
            query.review_rating = rating;
        }

        // Get reviews with pagination
        const skip = (page - 1) * limit;
        const reviews = await findReview({
            query,
            options: {
                sort: { [sortBy]: sortType === 'asc' ? 1 : -1 },
                skip,
                limit,
                populate: [
                    { path: 'user_id', select: 'user_fullName user_avatar' },
                    { path: 'sku_id', select: 'sku_name sku_thumb', populate: { path: 'sku_product', select: 'product_name' } },
                    { path: 'review_images' }
                ]
            }
        });

        // Get total count
        const totalReviews = await reviewModel.countDocuments(query);

        // Calculate statistics for all reviews of this shop
        const allReviews = await findReview({
            query: { shop_id: shopId },
            options: { select: 'review_rating' }
        });

        let averageRating = 0;
        const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (allReviews.length > 0) {
            const totalRating = allReviews.reduce((sum, review) => sum + review.review_rating, 0);
            averageRating = Math.round((totalRating / allReviews.length) * 10) / 10;

            // Count ratings breakdown
            allReviews.forEach(review => {
                ratingBreakdown[review.review_rating as keyof typeof ratingBreakdown]++;
            });
        }

        return {
            reviews,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews,
                limit
            },
            statistics: {
                totalReviews: allReviews.length,
                averageRating,
                ratingBreakdown
            }
        };
    }
}