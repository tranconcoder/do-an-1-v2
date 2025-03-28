import { Resources, RoleActions } from '@/enums/rbac.enum.js';
import { ac } from '@/configs/accesscontrol.config.js';

export const authorization = (action: RoleActions, resources: Resources) => {
    ac.can()
};
