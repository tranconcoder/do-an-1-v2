import type { RootFilterQuery } from 'mongoose';

import { userModel } from '../models/user.model';
import _ from 'lodash';
import mongoose from 'mongoose';

export default class UserService {
    public static newInstance = (
        user: serviceTypes.user.arguments.NewInstance
    ) => {
        return new userModel(user);
    };
    public static saveInstance = async (
        user: ReturnType<typeof this.newInstance>
    ) => {
        return await user.save();
    };

    public static findOne = async (
        query: RootFilterQuery<modelTypes.auth.UserSchema>
    ) => {
        return await userModel.findOne(query).lean();
    };

    public static checkUserExist = async (
        query: RootFilterQuery<modelTypes.auth.UserSchema>
    ) => {
        return await userModel.exists(query).lean();
    };

    public static saveUser = async (data: modelTypes.auth.UserSchema) => {
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
