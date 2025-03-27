import { RoleNames } from '@/enums/rbac.enum.js';
import resourceModel from '@/models/resource.model.js';
import roleModel from '@/models/role.model.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import { generateFindOne, generateFindOneAndUpdate } from '@/utils/mongoose.util.js';
import mongoose from 'mongoose';

/* ------------------- Find one and update ------------------ */
export const findOneAndUpdateResource =
    generateFindOneAndUpdate<model.rbac.ResourceSchema>(resourceModel);

export const findOneAndUpdateRole = generateFindOneAndUpdate<model.rbac.RoleSchema>(roleModel);

/* ------------------------ Find one ------------------------ */
export const findOneRole = generateFindOne<model.rbac.RoleSchema>(roleModel);

/* -------------------- Get user role id -------------------- */
export const getUserRoleId = async () => {
    const role = await findOneRole({
        query: { role_name: RoleNames.USER }
    }).lean();

    if (!role) throw new NotFoundErrorResponse({ message: 'Default role not found!' });

    return role._id as mongoose.Types.ObjectId;
};
