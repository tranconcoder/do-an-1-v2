import Joi from 'joi';
import _ from 'lodash';
import { passwordType, phoneNumber } from '@/configs/joi.config.js';
import {ShopStatus, ShopType} from '@/enums/shop.enum.js';
import { required } from '@/configs/mongoose.config.js';
import { ObjectId } from '@/configs/mongoose.config.js';

/* ------------------------------------------------------ */
/*                      User schema                       */
/* ------------------------------------------------------ */
const user: joiTypes.utils.ConvertObjectToJoiType<joiTypes.auth.UserSchema> = {
    email: Joi.string().email().required(),
    phoneNumber,
    fullName: Joi.string().required().min(4).max(30),
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
        /* -------------------- Shop information -------------------- */
        shop_name: Joi.string().required().min(6).max(30),
        shop_email: Joi.string().email().required(),
        shop_type: Joi.string().valid(...Object.values(ShopType)).required(),
        shop_certificate: Joi.string().required(),
        shop_location: Joi.object<joiTypes.auth.SignUpShop["shop_location"]>({

        }),
        shop_phoneNumber: Joi.string().required(),
        /* shop_phoneNumber: { type: String, required },
        shop_description: String, */

        /* -------------------- Shop inventories -------------------- */
        /* shop_warehouses: {
            type: [
                {
                    name: { type: String, required },
                    address: { type: ObjectId, required },
                    phoneNumber: { type: String, required }
                }
            ],
            default: []
        }, */

        /* ----------------------- Shop owner ----------------------- */
        /* shop_owner_fullName: { type: String, required },
        shop_owner_email: { type: String, required },
        shop_owner_phoneNumber: { type: String, required },
        shop_owner_cardID: { type: String, required }, */

        /* --------------------- Shop status --------------------- */
        /* shop_status: { type: String, enum: ShopStatus, default: ShopStatus.PENDING },
        is_brand: { type: Boolean, default: false } */
    }
);


/* ------------------------------------------------------ */
/*                    New token schema                    */
/* ------------------------------------------------------ */
export const newTokenSchema = Joi.object<joiTypes.auth.NewTokenSchema>({
    refreshToken: Joi.string().required()
});


