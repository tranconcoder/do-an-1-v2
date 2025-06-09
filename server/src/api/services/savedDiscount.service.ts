import {
    addSavedDiscount,
    removeSavedDiscount,
    findSavedDiscount,
    getUserSavedDiscounts,
    getUserSavedDiscountIds,
    countUserSavedDiscounts
} from '@/models/repository/savedDiscount/index.js';
import { findDiscountById } from '@/models/repository/discount/index.js';
import {
    BadRequestErrorResponse,
    ConflictErrorResponse,
    NotFoundErrorResponse
} from '@/response/error.response.js';

export default class SavedDiscountService {
    /* ---------------------------------------------------------- */
    /*                        Save Discount                       */
    /* ---------------------------------------------------------- */
    public static saveDiscount = async ({
        userId,
        discountId
    }: {
        userId: string;
        discountId: string;
    }) => {
        // Check if discount exists and is available
        const discount = await findDiscountById({
            id: discountId,
            options: { lean: true }
        });

        if (!discount) {
            throw new NotFoundErrorResponse({ message: 'Discount not found!' });
        }

        if (!discount.is_available || !discount.is_publish) {
            throw new BadRequestErrorResponse({ message: 'Discount is not available!' });
        }

        // Check if already saved and add discount (repository handles validation)
        try {
            return await addSavedDiscount({ userId, discountId });
        } catch (error: any) {
            if (error.message === 'Discount already saved') {
                throw new ConflictErrorResponse({ message: 'Discount already saved!' });
            }
            if (error.message === 'Không thể lưu quá 100 mã giảm giá') {
                throw new BadRequestErrorResponse({ message: error.message });
            }
            throw error;
        }
    };

    /* ---------------------------------------------------------- */
    /*                       Unsave Discount                      */
    /* ---------------------------------------------------------- */
    public static unsaveDiscount = async ({
        userId,
        discountId
    }: {
        userId: string;
        discountId: string;
    }) => {
        const result = await removeSavedDiscount({ userId, discountId });
        if (!result) {
            throw new NotFoundErrorResponse({ message: 'Saved discount not found!' });
        }
        return { success: true };
    };

    /* ---------------------------------------------------------- */
    /*                    Get Saved Discounts                     */
    /* ---------------------------------------------------------- */
    public static getUserSavedDiscounts = async ({
        userId,
        limit = 20,
        page = 1
    }: {
        userId: string;
        limit?: number;
        page?: number;
    }) => {
        const savedDiscounts = await getUserSavedDiscounts({ userId, limit, page });
        const totalCount = await countUserSavedDiscounts(userId);

        return {
            discounts: savedDiscounts,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        };
    };

    /* ---------------------------------------------------------- */
    /*                 Get User Saved Discount IDs                */
    /* ---------------------------------------------------------- */
    public static getUserSavedDiscountIds = async (userId: string) => {
        return await getUserSavedDiscountIds(userId);
    };

    /* ---------------------------------------------------------- */
    /*                   Check if Discount Saved                  */
    /* ---------------------------------------------------------- */
    public static isDiscountSaved = async ({
        userId,
        discountId
    }: {
        userId: string;
        discountId: string;
    }) => {
        const isSaved = await findSavedDiscount({ userId, discountId });
        return { isSaved };
    };
} 