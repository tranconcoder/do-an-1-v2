import savedDiscountModel, { SavedDiscountDocument } from '@/models/savedDiscount.model.js';
import {
    generateFindOne,
    generateFindOneAndUpdate,
    convertToMongooseId
} from '@/utils/mongoose.util.js';
import { ConflictErrorResponse, BadRequestErrorResponse } from '@/response/error.response.js';

/* ---------------------------------------------------------- */
/*                           Common                           */
/* ---------------------------------------------------------- */
export const findOneSavedDiscount = generateFindOne<SavedDiscountDocument>(savedDiscountModel);

export const findOneAndUpdateSavedDiscount = generateFindOneAndUpdate<SavedDiscountDocument>(savedDiscountModel);

/* ---------------------------------------------------------- */
/*                       Save Discount                        */
/* ---------------------------------------------------------- */
export const addSavedDiscount = async ({
    userId,
    discountId
}: {
    userId: string;
    discountId: string;
}): Promise<SavedDiscountDocument> => {
    const userObjectId = convertToMongooseId(userId);
    const discountObjectId = convertToMongooseId(discountId);

    // Check if user document exists
    let savedDiscountDoc = await findOneSavedDiscount({
        query: { user_id: userObjectId },
        options: { lean: false }
    });

    if (!savedDiscountDoc) {
        // Create new document if doesn't exist
        return await savedDiscountModel.create({
            user_id: userObjectId,
            saved_discounts: [{
                discount_id: discountObjectId,
                saved_at: new Date()
            }]
        });
    }

    // Check if discount already saved
    const isAlreadySaved = savedDiscountDoc.saved_discounts.some(
        item => item.discount_id.toString() === discountId
    );

    if (isAlreadySaved) {
        throw new ConflictErrorResponse({ message: 'Discount already saved' });
    }

    // Check limit
    if (savedDiscountDoc.saved_discounts.length >= 100) {
        throw new BadRequestErrorResponse({ message: 'Không thể lưu quá 100 mã giảm giá' });
    }

    // Add new discount using $push
    return await findOneAndUpdateSavedDiscount({
        query: { user_id: userObjectId },
        update: {
            $push: {
                saved_discounts: {
                    discount_id: discountObjectId,
                    saved_at: new Date()
                }
            }
        },
        options: { new: true }
    });
};

/* ---------------------------------------------------------- */
/*                      Remove Discount                       */
/* ---------------------------------------------------------- */
export const removeSavedDiscount = async ({
    userId,
    discountId
}: {
    userId: string;
    discountId: string;
}): Promise<boolean> => {
    const result = await findOneAndUpdateSavedDiscount({
        query: { user_id: convertToMongooseId(userId) },
        update: {
            $pull: {
                saved_discounts: { discount_id: convertToMongooseId(discountId) }
            }
        },
        options: { new: true }
    });

    return !!result;
};

/* ---------------------------------------------------------- */
/*                      Check if Saved                        */
/* ---------------------------------------------------------- */
export const findSavedDiscount = async ({
    userId,
    discountId
}: {
    userId: string;
    discountId: string;
}): Promise<boolean> => {
    const savedDiscountDoc = await findOneSavedDiscount({
        query: {
            user_id: convertToMongooseId(userId),
            'saved_discounts.discount_id': convertToMongooseId(discountId)
        },
        options: { lean: true }
    });

    return !!savedDiscountDoc;
};

/* ---------------------------------------------------------- */
/*                    Get User Saved Data                     */
/* ---------------------------------------------------------- */
export const getUserSavedDiscounts = async ({
    userId,
    limit = 20,
    page = 1
}: {
    userId: string;
    limit?: number;
    page?: number;
}) => {
    const skip = (page - 1) * limit;

    const savedDiscountDoc = await savedDiscountModel
        .findOne({ user_id: convertToMongooseId(userId) })
        .populate('saved_discounts.discount_id')
        .lean();

    if (!savedDiscountDoc) {
        return [];
    }

    // Sort by saved_at descending and apply pagination
    const sortedDiscounts = savedDiscountDoc.saved_discounts
        .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime())
        .slice(skip, skip + limit);

    return sortedDiscounts;
};

export const getUserSavedDiscountIds = async (userId: string): Promise<string[]> => {
    const savedDiscountDoc = await findOneSavedDiscount({
        query: { user_id: convertToMongooseId(userId) },
        select: ['saved_discounts.discount_id'],
        options: { lean: true }
    });

    if (!savedDiscountDoc) {
        return [];
    }

    return savedDiscountDoc.saved_discounts.map(item => item.discount_id.toString());
};

export const countUserSavedDiscounts = async (userId: string): Promise<number> => {
    const savedDiscountDoc = await findOneSavedDiscount({
        query: { user_id: convertToMongooseId(userId) },
        select: ['saved_discounts'],
        options: { lean: true }
    });

    return savedDiscountDoc ? savedDiscountDoc.saved_discounts.length : 0;
}; 