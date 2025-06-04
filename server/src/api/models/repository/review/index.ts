import reviewModel from "@/models/review.model";
import { generateFindAll, generateFindById, generateFindOne } from "@/utils/mongoose.util";

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
/* ----------------------- Find by id ----------------------- */
export const findReviewById = generateFindById<model.review.ReviewSchema>(reviewModel);

/* ------------------------ Find one ------------------------ */
export const findOneReview = generateFindOne<model.review.ReviewSchema>(reviewModel);

export const findReview = generateFindAll<model.review.ReviewSchema>(reviewModel);

