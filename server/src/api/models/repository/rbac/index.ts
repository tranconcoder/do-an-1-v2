import { RoleNames } from '@/enums/rbac.enum.js';
import resourceModel from '@/models/resource.model.js';
import roleModel from '@/models/role.model.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import {
    generateFindAll,
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';
import mongoose from 'mongoose';

/* ------------------- Find one and update ------------------ */
export const findOneAndUpdateResource =
    generateFindOneAndUpdate<model.rbac.ResourceSchema>(resourceModel);

export const findOneAndUpdateRole = generateFindOneAndUpdate<model.rbac.RoleSchema>(roleModel);

/* ----------------------- Find by id ----------------------- */
export const findRoleById = generateFindById<model.rbac.RoleSchema>(roleModel);

/* ------------------------ Find one ------------------------ */
export const findOneRole = generateFindOne<model.rbac.RoleSchema>(roleModel);

/* -------------------------- Find -------------------------- */
export const findRoles = generateFindAll<model.rbac.RoleSchema>(roleModel);

/* -------------------- Get user role id -------------------- */
export const getRoleIdByName = async (name: RoleNames) => {
    const role = await findOneRole({
        query: { role_name: name }
    }).lean();

    if (!role) throw new NotFoundErrorResponse({ message: 'Default role not found!' });

    return role._id as mongoose.Types.ObjectId;
};
