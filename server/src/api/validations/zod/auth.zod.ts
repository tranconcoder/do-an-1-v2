import z from 'zod';
import _ from 'lodash';
import { mongooseId, passwordType, phoneNumber } from '@/configs/joi.config.js';
import { ShopType } from '@/enums/shop.enum.js';
import { UserStatus } from '@/enums/user.enum.js';
import { password } from 'bun';
import { generateValidateWithBody } from '@/middlewares/zod.middleware';

/* ------------------------------------------------------ */
/*                      User schema                       */
/* ------------------------------------------------------ */
const userBase = z.object({
    /* -------------------------- Auth -------------------------- */
    _id: mongooseId,
    phoneNumber,
    password: passwordType,

    /* ----------------------- Information ---------------------- */
    user_email: z.string().email(),
    user_fullName: z.string().min(4).max(30),
    user_avatar: z.string().optional().nullable(),
    user_sex: z.boolean().optional().nullable(),

    /* ------------------------ Metadata ------------------------ */
    user_status: z.nativeEnum(UserStatus).optional(),
    user_role: z.string().optional()
});
export type UserBase = z.infer<typeof userBase>;

/* ------------------------------------------------------ */
/*                      Login schema                      */
/* ------------------------------------------------------ */
export const loginSchema = userBase.pick({
    phoneNumber: true,
    password: true
});
export type LoginSchema = z.infer<typeof loginSchema>;

/* ------------------------------------------------------ */
/*                    Sign up schema                      */
/* ------------------------------------------------------ */
export const signUpSchema = userBase.pick({
    user_fullName: true,
    user_email: true,
    password: true,
    phoneNumber: true
});
export type SignUpSchema = z.infer<typeof signUpSchema>;

/* ---------------------------------------------------------- */
/*                    Sign up shop schema                     */
/* ---------------------------------------------------------- */
export const shopLocation = z.object({
    province: mongooseId,
    district: mongooseId,
    ward: mongooseId,
    address: z.string().max(200)
});
export type ShopLocation = z.infer<typeof shopLocation>;

export const signUpShop = z.object({
    /* -------------------- Authenticate -------------------- */
    phoneNumber,
    password: passwordType,

    /* -------------------- Shop information -------------------- */
    shop_name: z.string().min(6).max(30),
    shop_email: z.string().email(),
    shop_type: z.nativeEnum(ShopType),
    shop_certificate: z.string(),
    shop_location: shopLocation,
    shop_phoneNumber: phoneNumber,
    shop_description: z.string().max(200).optional().nullable(),

    /* ----------------------- Shop owner ----------------------- */
    shop_owner_fullName: z.string().min(6).max(30),
    shop_owner_email: z.string().email(),
    shop_owner_phoneNumber: phoneNumber,
    shop_owner_cardID: z.string(),

    warehouses: z.array(
        z.object({
            name: z.string(),
            address: shopLocation,
            phoneNumber
        })
    )
});
export type SignUpShop = z.infer<typeof signUpShop>;

/* ------------------------------------------------------ */
/*                    New token schema                    */
/* ------------------------------------------------------ */
export const newTokenSchema = z.object({
    refreshToken: z.string().min(1)
});
export type NewTokenSchema = z.infer<typeof newTokenSchema>;

/* ------------------------------------------------------ */
/*                    Forgot password schema              */
/* ------------------------------------------------------ */
export const forgotPasswordSchema = z.object({
    email: z.string().email(),
    newPassword: passwordType
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const validateLogin = generateValidateWithBody(loginSchema);
export const validateSignUp = generateValidateWithBody(signUpSchema);
export const validateSignUpShop = generateValidateWithBody(signUpShop);
export const validateNewToken = generateValidateWithBody(newTokenSchema);
export const validateForgotPassword = generateValidateWithBody(forgotPasswordSchema);
