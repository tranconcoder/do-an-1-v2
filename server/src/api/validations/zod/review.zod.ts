import { generateValidateWithBody } from '@/middlewares/zod.middleware';
import { z } from 'zod';
import { zodId } from './index';

export const createReviewSchema = z.object({
    order_id: zodId,
    sku_id: zodId,

    review_content: z.string().min(1).max(1000),
    review_rating: z.number().min(1).max(5),
    review_images: z.array(zodId).optional(),
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;

export const validateCreateReview = generateValidateWithBody(createReviewSchema);