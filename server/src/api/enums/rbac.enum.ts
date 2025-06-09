export enum RoleActions {
    /* ------------------------- Create ------------------------- */
    CREATE_ANY = 'create:any',
    CREATE_OWN = 'create:own',

    /* ------------------------- Update ------------------------- */
    UPDATE_ANY = 'update:any',
    UPDATE_OWN = 'update:own',

    /* ------------------------- Read ------------------------- */
    READ_ANY = 'read:any',
    READ_OWN = 'read:own',

    /* ------------------------- Delete ------------------------- */
    DELETE_ANY = 'delete:any',
    DELETE_OWN = 'delete:own'
}

export enum RoleNames {
    USER = 'user',
    SHOP = 'shop',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin'
}

export enum RoleStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted'
}

export enum Resources {
    CATEGORY = 'category',
    SHOP = 'shop',
    PROFILE = 'profile',
    ORDER = 'order',
    PRODUCT = 'product',
    CART = 'cart',
    WAREHOUSES = 'warehouses',
    DISCOUNT = 'discount',
    SHOP_ANALYTICS = 'shop_analytics'
}

export enum ResourceStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted'
}
