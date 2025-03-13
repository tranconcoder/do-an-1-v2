import Joi from 'joi';

/* ====================================================== */
/*                      PHONE PRODUCT                     */
/* ====================================================== */
export const createPhoneSchema = Joi.object<
    joiTypes.product.definition.CreatePhoneSchema,
    true
>({
    phone_processor: Joi.string().required(),
    phone_brand: Joi.string().required(),
    phone_memory: Joi.string().required(),
    phone_storage: Joi.number().required(),
    phone_color: Joi.string().required(),
    phone_battery: Joi.object<
        joiTypes.product.definition.CreatePhoneSchema['phone_battery'],
        true
    >({
        capacity: Joi.number().required(),
        battery_techology: Joi.string().required(),
        charge_technology: Joi.string()
    }).required(),
    phone_warranty: Joi.string().required(),
    phone_camera: Joi.object<
        joiTypes.product.definition.CreatePhoneSchema['phone_camera'],
        true
    >({
        front: Joi.string().optional(),
        back: Joi.string().optional()
    }),
    phone_screen: Joi.object<
        joiTypes.product.definition.CreatePhoneSchema['phone_screen'],
        true
    >({
        size: Joi.number().required(),
        resolution: Joi.object({
            width: Joi.number().required(),
            height: Joi.number().required()
        }).required(),
        technology: Joi.string().required(),
        max_brightness: Joi.number(),
        refresh_rate: Joi.number()
    }).required(),
    phone_connectivity: Joi.object<
        joiTypes.product.definition.CreatePhoneSchema['phone_connectivity'],
        true
    >({
        sim_count: Joi.number().required(),
        network: Joi.string().required(),
        usb: Joi.string().required(),
        wifi: Joi.string(),
        bluetooth: Joi.string(),
        gps: Joi.string()
    }).required(),
    phone_special_features: Joi.array().items(Joi.string()).required(),
    phone_material: Joi.string().required(),
    phone_weight: Joi.number().required(),
    is_smartphone: Joi.boolean().required()
});

export const updatePhoneSchema = Joi.object<
    joiTypes.product.definition.UpdatePhoneSchema,
    true
>({
    phone_processor: Joi.string(),
    phone_brand: Joi.string(),
    phone_memory: Joi.string(),
    phone_storage: Joi.number(),
    phone_color: Joi.string(),
    phone_battery: Joi.object<
        Required<joiTypes.product.definition.UpdatePhoneSchema>['phone_battery'],
        true
    >({
        capacity: Joi.number(),
        battery_techology: Joi.string(),
        charge_technology: Joi.string()
    }),
    phone_warranty: Joi.string(),
    phone_camera: Joi.object<
        Required<joiTypes.product.definition.UpdatePhoneSchema>['phone_camera'],
        true
    >({
        front: Joi.string(),
        back: Joi.string()
    }),
    phone_screen: Joi.object<
        Required<joiTypes.product.definition.UpdatePhoneSchema>['phone_screen'],
        true
    >({
        size: Joi.number(),
        resolution: Joi.object({
            width: Joi.number(),
            height: Joi.number()
        }),
        technology: Joi.string(),
        max_brightness: Joi.number(),
        refresh_rate: Joi.number()
    }),
    phone_connectivity: Joi.object<
        Required<joiTypes.product.definition.UpdatePhoneSchema>['phone_connectivity'],
        true
    >({
        sim_count: Joi.number(),
        network: Joi.string(),
        usb: Joi.string(),
        wifi: Joi.string(),
        bluetooth: Joi.string(),
        gps: Joi.string()
    }),
    phone_special_features: Joi.array().items(Joi.string()),
    phone_material: Joi.string(),
    phone_weight: Joi.number(),
    is_smartphone: Joi.boolean()
});
