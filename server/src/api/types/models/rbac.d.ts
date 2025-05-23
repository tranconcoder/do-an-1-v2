import type { RoleNames, RoleStatus, ResourceStatus } from '@/enums/rbac.enum.ts';

declare global {
    namespace model {
        namespace rbac {
            interface CommonTypes {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type RoleSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    /* ----------------------- Information ---------------------- */
                    role_name: RoleNames;
                    role_slug: string;
                    role_desc: string;
                    role_status: RoleStatus;

                    role_granted: Array<{
                        resource: moduleTypes.mongoose.ObjectId;
                        actions: string[];
                        attributes: string;
                    }>;
                },
                isModel,
                isDoc,
                CommonTypes
            >;

            type ResourceSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    resource_name: string;
                    resource_slug: string;
                    resource_desc: string;
                    resource_status: ResourceStatus;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
