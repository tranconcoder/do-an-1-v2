"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newTokenSchema = exports.signUpSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const lodash_1 = __importDefault(require("lodash"));
/* ------------------------------------------------------ */
/*                      User schema                       */
/* ------------------------------------------------------ */
const user = {
    email: joi_1.default.string().email().required(),
    fullName: joi_1.default.string().required().min(4).max(30),
    phoneNumber: joi_1.default.string()
        .required()
        .regex(/(\+84|84|0[3|5|7|8|9])+([0-9]{8})\b/),
    password: joi_1.default.string()
        .required()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    role: joi_1.default.string().required()
};
/* ------------------------------------------------------ */
/*                      Login schema                      */
/* ------------------------------------------------------ */
exports.loginSchema = joi_1.default.object(lodash_1.default.pick(user, ['phoneNumber', 'password']));
/* ------------------------------------------------------ */
/*                      Sinup schema                      */
/* ------------------------------------------------------ */
exports.signUpSchema = joi_1.default.object(lodash_1.default.pick(user, ['email', 'fullName', 'password', 'phoneNumber']));
/* ------------------------------------------------------ */
/*                    New token schema                    */
/* ------------------------------------------------------ */
exports.newTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required()
});
