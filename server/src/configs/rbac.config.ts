import mongoose from 'mongoose';
import { RoleNames } from '@/enums/rbac.enum.js';
import { findOneShop } from '@/models/repository/shop/index.js';

type RoleHandleGetDataStrategy = {
    [key in RoleNames]: (id: string) => Promise<mongoose.Document | null>;
};
export const roleHandleGetDataStrategy: RoleHandleGetDataStrategy = {
    [RoleNames.SHOP]: async (userId: string) =>
        await findOneShop({ query: { shop_userId: userId } }),

    [RoleNames.ADMIN]: async (id) => null,
    [RoleNames.SUPER_ADMIN]: async (id) => null,
    [RoleNames.USER]: async (id) => null
};
