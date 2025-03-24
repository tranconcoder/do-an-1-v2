import Joi from 'joi';
import _ from 'lodash';
import { passwordType } from '@/configs/joi.config.js';
import {ShopType} from '@/enums/shop.enum.js';

/* ------------------------------------------------------ */
/*                      User schema                       */
/* ------------------------------------------------------ */
const user: joiTypes.utils.ConvertObjectToJoiType<joiTypes.auth.UserSchema> = {
    email: Joi.string().email().required(),
    fullName: Joi.string().required().min(4).max(30),
    phoneNumber: Joi.string()
        .required()
        .regex(/(\+84|84|0[3|5|7|8|9])+([0-9]{8})\b/),
    password: passwordType,     role: Joi.string().required()
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
    _.pick(user, ['email', 'fullName', 'password', 'phoneNumber'])
);


/* ---------------------------------------------------------- */
/*                    Sign up shop schema                     */
/* ---------------------------------------------------------- */
export const signUpShop = Joi.object<joiTypes.auth.SignUpShop>(
    {
    }
);


/* ------------------------------------------------------ */
/*                    New token schema                    */
/* ------------------------------------------------------ */
export const newTokenSchema = Joi.object<joiTypes.auth.NewTokenSchema>({
    refreshToken: Joi.string().required()
});


