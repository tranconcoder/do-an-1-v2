import type { Permission, Query } from 'accesscontrol';

import { Resources, RoleActions, RoleStatus } from '@/enums/rbac.enum.js';
import { ac } from '@/configs/accesscontrol.config.js';
import { Request, Response, NextFunction } from 'express';
import { AccessControl } from 'accesscontrol';
import RBACService from '@/services/rbac.service.js';
import { findOneRole } from '@/models/repository/rbac/index.js';
import { ForbiddenErrorResponse } from '@/response/error.response.js';
import catchError from './catchError.middleware.js';

export const authorization = (action: keyof Query, resources: Resources) => {
    return catchError(async (req, _, next) => {
        try {
            /* ----------------------- Check role ----------------------- */
            const role = await findOneRole({
                query: { _id: req.role },
                select: ['role_status'],
                options: { lean: true }
            });
            if (!role) throw new ForbiddenErrorResponse({ message: 'Invalid role!' });
            console.log(role);
            if (role.role_status !== RoleStatus.ACTIVE)
                throw new ForbiddenErrorResponse({ message: 'Role is not active!' });

            /* -------------------- Check permission -------------------- */
            console.log({ role });
            const controlList = await RBACService.getInstance().getAccessControlList();
            const ac = new AccessControl(controlList);
            const permission = ac.can(role.role_name)[action](resources) as Permission;

            if (!permission.granted)
                throw new ForbiddenErrorResponse({ message: 'Permission denied!' });

            next();
        } catch (error) {
            next(error);
        }
    });
};
