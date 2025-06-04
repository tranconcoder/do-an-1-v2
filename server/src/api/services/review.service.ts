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
}