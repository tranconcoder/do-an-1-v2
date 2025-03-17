"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePhoneSchema = exports.createPhoneSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/* ====================================================== */
/*                      PHONE PRODUCT                     */
/* ====================================================== */
exports.createPhoneSchema = joi_1.default.object({
    phone_processor: joi_1.default.string().required(),
    phone_brand: joi_1.default.string().required(),
    phone_memory: joi_1.default.string().required(),
    phone_storage: joi_1.default.number().required(),
    phone_color: joi_1.default.string().required(),
    phone_battery: joi_1.default.object({
        capacity: joi_1.default.number().required(),
        battery_techology: joi_1.default.string().required(),
        charge_technology: joi_1.default.string()
    }).required(),
    phone_warranty: joi_1.default.string().required(),
    phone_camera: joi_1.default.object({
        front: joi_1.default.string().optional(),
        back: joi_1.default.string().optional()
    }),
    phone_screen: joi_1.default.object({
        size: joi_1.default.number().required(),
        resolution: joi_1.default.object({
            width: joi_1.default.number().required(),
            height: joi_1.default.number().required()
        }).required(),
        technology: joi_1.default.string().required(),
        max_brightness: joi_1.default.number(),
        refresh_rate: joi_1.default.number()
    }).required(),
    phone_connectivity: joi_1.default.object({
        sim_count: joi_1.default.number().required(),
        network: joi_1.default.string().required(),
        usb: joi_1.default.string().required(),
        wifi: joi_1.default.string(),
        bluetooth: joi_1.default.string(),
        gps: joi_1.default.string()
    }).required(),
    phone_special_features: joi_1.default.array().items(joi_1.default.string()).required(),
    phone_material: joi_1.default.string().required(),
    phone_weight: joi_1.default.number().required(),
    is_smartphone: joi_1.default.boolean().required()
});
exports.updatePhoneSchema = joi_1.default.object({
    phone_processor: joi_1.default.string(),
    phone_brand: joi_1.default.string(),
    phone_memory: joi_1.default.string(),
    phone_storage: joi_1.default.number(),
    phone_color: joi_1.default.string(),
    phone_battery: joi_1.default.object({
        capacity: joi_1.default.number(),
        battery_techology: joi_1.default.string(),
        charge_technology: joi_1.default.string()
    }),
    phone_warranty: joi_1.default.string(),
    phone_camera: joi_1.default.object({
        front: joi_1.default.string(),
        back: joi_1.default.string()
    }),
    phone_screen: joi_1.default.object({
        size: joi_1.default.number(),
        resolution: joi_1.default.object({
            width: joi_1.default.number(),
            height: joi_1.default.number()
        }),
        technology: joi_1.default.string(),
        max_brightness: joi_1.default.number(),
        refresh_rate: joi_1.default.number()
    }),
    phone_connectivity: joi_1.default.object({
        sim_count: joi_1.default.number(),
        network: joi_1.default.string(),
        usb: joi_1.default.string(),
        wifi: joi_1.default.string(),
        bluetooth: joi_1.default.string(),
        gps: joi_1.default.string()
    }),
    phone_special_features: joi_1.default.array().items(joi_1.default.string()),
    phone_material: joi_1.default.string(),
    phone_weight: joi_1.default.number(),
    is_smartphone: joi_1.default.boolean()
});
