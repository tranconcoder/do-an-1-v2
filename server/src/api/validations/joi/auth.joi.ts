import Joi from 'joi';
import _ from 'lodash';
import { mongooseId, passwordType, phoneNumber } from '@/configs/joi.config.js';
import { ShopType } from '@/enums/shop.enum.js';
import { UserStatus } from '@/enums/user.enum.js';

/* ------------------------------------------------------ */
/*                      User schema                       */
/* ------------------------------------------------------ */
const user: joiTypes.utils.ConvertObjectToJoiType<joiTypes.auth.UserSchema> = {
    /* -------------------------- Auth -------------------------- */
    _id: mongooseId,
    phoneNumber,
    password: passwordType,

    /* ---------------------- Information  ---------------------- */
    user_email: Joi.string().email().required(),
    user_fullName: Joi.string().required().min(4).max(30),
    user_avatar: Joi.string().empty().optional(),
    user_sex: Joi.boolean().empty().optional(),

    /* ------------------------ Metadata ------------------------ */
    user_status: Joi.string().valid(...Object.values(UserStatus)),
    user_role: Joi.string().required()
};

/* ------------------------------------------------------ */
/*                      Login schema                      */
/* ------------------------------------------------------ */
export const loginSchema = Joi.object<joiTypes.auth.LoginSchema, true>(
    _.pick(user, ['phoneNumber', 'password'])
);

/* ------------------------------------------------------ */
/*                    Sign up schema                      */
/* ------------------------------------------------------ */
export const signUpSchema = Joi.object<joiTypes.auth.SignUpSchema, true>(
    _.pick(user, ['user_fullName', 'user_email', 'password', 'phoneNumber'])
);

/* ---------------------------------------------------------- */
/*                    Sign up shop schema                     */
/* ---------------------------------------------------------- */
const shopLocation = Joi.object({
    province: mongooseId,
    district: mongooseId,
    ward: mongooseId,
    address: Joi.string().required().max(200)
});
export const signUpShop = Joi.object<joiTypes.auth.SignUpShop>({
    /* -------------------- Authenticate -------------------- */
    phoneNumber: phoneNumber,
    password: passwordType,

    /* -------------------- Shop information -------------------- */
    shop_name: Joi.string().required().min(6).max(30),
    shop_email: Joi.string().email().required(),
    shop_type: Joi.string()
        .valid(...Object.values(ShopType))
        .required(),
    shop_certificate: Joi.string().required(),
    shop_location: shopLocation.required(),
    shop_phoneNumber: Joi.string().required(),
    shop_description: Joi.string().max(200).empty().optional(),

    /* ----------------------- Shop owner ----------------------- */
    shop_owner_fullName: Joi.string().min(6).max(30).required(),
    shop_owner_email: Joi.string().email().required(),
    shop_owner_phoneNumber: phoneNumber,
    shop_owner_cardID: Joi.string().required(),

    warehouses: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required(),
                address: shopLocation,
                phoneNumber: phoneNumber
            })
        )
        .required()
});

/* ------------------------------------------------------ */
/*                    New token schema                    */
/* ------------------------------------------------------ */
export const newTokenSchema = Joi.object<joiTypes.auth.NewTokenSchema>({
    refreshToken: Joi.string().required()
});

/* ------------------------------------------------------ */
/*                    Forgot password schema              */
/* ------------------------------------------------------ */
export const forgotPasswordSchema = Joi.object<joiTypes.auth.ForgotPasswordSchema>({
    email: user.user_email,
    newPassword: user.password
});