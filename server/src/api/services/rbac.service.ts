import { roleHandleGetDataStrategy } from '@/configs/rbac.config.js';
import { Resources, RoleActions, RoleNames, RoleStatus } from '@/enums/rbac.enum.js';
import {
    findOneAndUpdateResource,
    findOneAndUpdateRole,
    findRoleById,
    findRoles
} from '@/models/repository/rbac/index.js';

class RBACService {
    public static instance: RBACService;

    private constructor() {}

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
                    actions: [RoleActions.ALL],
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
                        resource: resourcesId.find(
                            (resource) => resource.name === Resources.PROFILE
                        )?.id,
                        actions: [RoleActions.ALL],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((resource) => resource.name === Resources.CART)
                            ?.id,
                        actions: [RoleActions.READ_ANY],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((resource) => resource.name === Resources.ORDER)
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
                            (resource) => resource.name === Resources.PRODUCT
                        )?.id,
                        actions: [RoleActions.ALL],
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
                        resource: resourcesId
                            .find((resource) => resource.name === Resources.PRODUCT)
                            ?.id.toString(),
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_OWN,
                            RoleActions.READ_ANY,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN
                        ],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId
                            .find((resource) => resource.name === Resources.ORDER)
                            ?.id.toString(),
                        actions: [RoleActions.READ_OWN, RoleActions.UPDATE_OWN],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId
                            .find((resource) => resource.name === Resources.CART)
                            ?.id.toString(),
                        actions: [RoleActions.READ_OWN, RoleActions.UPDATE_OWN],
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
                            (resource) => resource.name === Resources.PROFILE
                        )?.id,
                        actions: [RoleActions.READ_OWN, RoleActions.UPDATE_OWN],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((resource) => resource.name === Resources.CART)
                            ?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_OWN,
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

        const roleData = await roleHandleGetDataStrategy[roleName](userId);
        console.log({ roleData });
        if (!roleData) return null;

        console.log({ roleData });

        return {
            role_name: roleName,
            role_data: roleData
        };
    }
}

export default RBACService;

export const roleService = new RoleService();
