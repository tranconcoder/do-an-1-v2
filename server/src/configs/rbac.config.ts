import mongoose from 'mongoose';
import { RoleNames } from '@/enums/rbac.enum.js';
import { findShopById } from '@/models/repository/shop/index.js';

/* ---------------------------------------------------------- */
/*       WARNING: ONLY USE GENERATE FIND BY ID FUNCTION       */
/* ---------------------------------------------------------- */
type RoleHandleGetDataStrategy = {
    [key in RoleNames]: (payload: { id: string }) => Promise<mongoose.Document | null>;
};
export const roleHandleGetDataStrategy: RoleHandleGetDataStrategy = {
    [RoleNames.SHOP]: findShopById,
    [RoleNames.ADMIN]: async ({ id }) => null,
    [RoleNames.SUPER_ADMIN]: async ({ id }) => null,
    [RoleNames.USER]: async ({ id }) => null
};
