import RBACService from '@/services/rbac.service.js';
import { AccessControl } from 'accesscontrol';

export const ac = new AccessControl(await RBACService.getInstance().getAccessControlList());
