import type { RootFilterQuery } from 'mongoose';

import { userModel } from '@/models/user.model.js';
import _ from 'lodash';
import mongoose from 'mongoose';
import { findOneUser, findUserById } from '@/models/repository/user/index.js';
import { roleService } from './rbac.service.js';
import { RoleNames } from '@/enums/rbac.enum.js';
import { findShopById } from '@/models/repository/shop/index.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import { ShopStatus } from '@/enums/shop.enum.js';

export default class UserService {
    /* -------------------- Get user by user -------------------- */
    public static getUserById = async (id: string) => {
        const user = await findUserById({
            id,
            only: ['_id', 'phoneNumber', 'user_email', 'user_role', 'user_fullName', 'user_avatar']
        });
        const result: commonTypes.object.ObjectAnyKeys = { user };

        /* --------------------- Add role data  --------------------- */
        const roleData = await roleService.getUserRoleData({
            userId: user._id.toString(),
            roleId: user.user_role.toString()
        });
        if (roleData && roleData.role_name !== RoleNames.USER)
            result[roleData.role_name] = roleData.role_data || true;

        return result;
    };

    public static getShopInfo = async (id: string) => {
        const shop = await findShopById({
            id,
            only: [
                '_id',
                'shop_userId',
                'shop_name',
                'shop_type',
                'shop_logo',
                'shop_location',
                'shop_status',
                'is_brand'
            ],
            options: {
                lean: true,
                populate: [
                    {
                        path: 'shop_location',
                        select: ['province', 'district'],
                        populate: {
                            path: 'province district',
                            select: ['province_name', 'district_name']
                        }
                    }
                ]
            }
        });

        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });
        if (shop.is_deleted) throw new NotFoundErrorResponse({ message: 'Shop is deleted!' });
        if (shop.shop_status !== ShopStatus.ACTIVE)
            throw new NotFoundErrorResponse({ message: 'Shop is not active!' });

        return { shop };
    };

    public static newInstance = (user: service.user.arguments.NewInstance) => {
        return new userModel(user);
    };

    public static saveInstance = async (user: ReturnType<typeof this.newInstance>) => {
        return await user.save();
    };

    public static findOne = async (query: RootFilterQuery<model.auth.UserSchema>) => {
        return await findOneUser({ query }).lean();
    };

    public static checkUserExist = async (query: RootFilterQuery<model.auth.UserSchema>) => {
        return await userModel.exists(query).lean();
    };

    public static saveUser = async (data: model.auth.UserSchema) => {
        const user = await userModel.create(data);

        return user ? _.pick(user, ['role', 'id']) : null;
    };

    public static removeUser = async (id: string) => {
        const result = await userModel.deleteOne({
            _id: new mongoose.Types.ObjectId(id)
        });

        return result.deletedCount > 0;
    };
}
