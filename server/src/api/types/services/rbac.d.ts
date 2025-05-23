import '';

declare global {
    namespace service {
        namespace rbac {
            namespace arguments {
                interface GetUserRoleData {
                    userId: string;
                    roleId: string;
                }
            }
        }
    }
}
