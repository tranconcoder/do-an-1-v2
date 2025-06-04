import { OkResponse } from '@/response/success.response';
import reviewService from '@/services/review.service';
import { RequestWithBody, RequestWithParams } from '@/types/request';
import { CreateReviewSchema } from '@/validations/zod/review.zod';

export default new class ReviewController {
    /* ---------------------------------------------------------- */
    /*                        Create review                       */
    /* ---------------------------------------------------------- */
    createReview: RequestWithBody<CreateReviewSchema> = async (req, res, _next) => {
        new OkResponse({
            message: 'Review created successfully',
            metadata: await reviewService.createReview(req.userId!, req.body)
        }).send(res);
    }


    /* ---------------------------------------------------------- */
    /*                    Get reviews by ORDER                    */
    /* ---------------------------------------------------------- */
    getReviewsByOrderId: RequestWithParams<{ orderId: string }> = async (req, res, _next) => {
        new OkResponse({
            message: 'Reviews fetched successfully',
            metadata: await reviewService.getReviewsByOrderId(req.params.orderId, req.userId!)
        }).send(res);
    }

    /* ---------------------------------------------------------- */
    /*                   Get last review by SKU                   */
    /* ---------------------------------------------------------- */
    getLastReviewBySkuId: RequestWithParams<{ skuId: string }> = async (req, res, _next) => {
        new OkResponse({
            message: 'Last review fetched successfully',
            metadata: await reviewService.getLastReviewBySkuId(req.params.skuId, req.userId!)
        }).send(res);
    }
}