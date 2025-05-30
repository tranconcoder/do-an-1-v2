import { roleHandleGetDataStrategy } from '@/configs/rbac.config.js';
import { Resources, RoleActions, RoleNames, RoleStatus } from '@/enums/rbac.enum.js';
import {
    findOneAndUpdateResource,
    findOneAndUpdateRole,
    findRoleById,
    findRoles
} from '@/models/repository/rbac/index.js';
import { findUserById } from '@/models/repository/user/index.js';

class RBACService {
    public static instance: RBACService;

    private constructor() { }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RBACService();
        }

        return this.instance;
    }

    async initRBAC() {
        /* --------------------- Init resources --------------------- */
        const resources = Object.values(Resources);
        const resourcesId = await Promise.all(
            resources.map(async (resource, index) => {
                const id = (
                    await findOneAndUpdateResource({
                        query: { resource_name: resource },
                        update: { resource_name: resource },
                        options: { upsert: true, new: true }
                    })
                )._id;

                return { id, name: resource };
            })
        );

        /* ---------------------------------------------------------- */
        /*                         INIT ROLES                         */
        /* ---------------------------------------------------------- */
        /* ----------------------- Super admin ---------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.SUPER_ADMIN },
            update: {
                role_name: RoleNames.SUPER_ADMIN,
                role_desc: 'Super Administrator',
                role_granted: resourcesId.map((resource) => ({
                    resource: resource.id,
                    actions: [
                        RoleActions.CREATE_ANY,
                        RoleActions.READ_ANY,
                        RoleActions.UPDATE_ANY,
                        RoleActions.DELETE_ANY
                    ],
                    attributes: '*'
                }))
            },
            options: { upsert: true, new: true }
        });

        /* -------------------------- Admin ------------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.ADMIN },
            update: {
                role_name: RoleNames.ADMIN,
                role_desc: 'Administrator',
                role_granted: [
                    {
                        resource: resourcesId.find((resource) => resource.name === Resources.SHOP)
                            ?.id,
                        actions: [
                            RoleActions.READ_ANY,
                            RoleActions.UPDATE_ANY,
                            RoleActions.DELETE_ANY
                        ],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find(
                            (resource) => resource.name === Resources.CATEGORY
                        )?.id,
                        actions: [
                            RoleActions.CREATE_ANY,
                            RoleActions.READ_ANY,
                            RoleActions.UPDATE_ANY,
                            RoleActions.DELETE_ANY
                        ],
                        attributes: '*'
                    }
                ]
            },
            options: { upsert: true, new: true }
        });

        /* -------------------------- Shop -------------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.SHOP },
            update: {
                role_name: RoleNames.SHOP,
                role_desc: 'Shop',
                role_status: 'active',
                role_granted: [
                    {
                        resource: resourcesId.find((resource) => resource.name === Resources.SHOP)
                            ?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_ANY,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN
                        ],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((resource) => resource.name === Resources.ORDER)
                            ?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN,
                            RoleActions.READ_OWN
                        ],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find(
                            (resource) => resource.name === Resources.PRODUCT
                        )?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_OWN,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN
                        ],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find(
                            (resource) => resource.name === Resources.WAREHOUSES
                        )?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_OWN,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN
                        ],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find(
                            (resource) => resource.name === Resources.DISCOUNT
                        )?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_OWN,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN
                        ],
                        attributes: '*'
                    }
                ]
            },
            options: { upsert: true, new: true }
        });

        /* -------------------------- User -------------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.USER },
            update: {
                role_name: RoleNames.USER,
                role_desc: 'User role',
                role_status: RoleStatus.ACTIVE,
                role_granted: [
                    {
                        resource: resourcesId.find(
                            (resource) => resource.name === Resources.PRODUCT
                        )?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_OWN,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN
                        ],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find(
                            (resource) => resource.name === Resources.ORDER
                        )?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_OWN,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN
                        ],
                        attributes: '*'
                    }
                ]
            },
            options: { upsert: true, new: true }
        });
    }

    async getAccessControlList() {
        const roles = await findRoles({
            query: {},
            options: { populate: 'role_granted.resource', lean: true }
        });

        const result = roles.flatMap((role) =>
            role.role_granted.flatMap((granted) => {
                const resource = granted.resource as any as model.rbac.ResourceSchema;

                return granted.actions.map((action) => ({
                    role: role.role_name,
                    resource: resource.resource_name,
                    action,
                    attributes: granted.attributes
                }));
            })
        );

        return result;
    }
}

class RoleService {
    async getUserRoleData({ userId, roleId }: service.rbac.arguments.GetUserRoleData) {
        const roleName: RoleNames = await findRoleById({
            id: roleId,
            options: { lean: true }
        }).then((role) => role.role_name);

        if (!roleName) return null;
        if (!roleHandleGetDataStrategy[roleName]) return null;

        return {
            role_name: roleName,
            role_data: await roleHandleGetDataStrategy[roleName](userId)
        };
    }

    async userIsAdmin(userId: string) {
        const user = await findUserById({
            id: userId,
            only: ['user_role'],
            options: { lean: true }
        });
        if (!user) return false;

        const role = await findRoleById({
            id: user.user_role,
            options: { lean: true }
        });
        if (!role) return false;
        if (role.role_name === RoleNames.SUPER_ADMIN) return true;
        if (role.role_name === RoleNames.ADMIN) return true;

        return false;
    }
}

export default RBACService;

export const roleService = new RoleService();
