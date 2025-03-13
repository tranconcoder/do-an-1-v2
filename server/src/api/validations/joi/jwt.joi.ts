import Joi from 'joi';
import _ from 'lodash';
import { mongooseId } from '../../../configs/joi.config';

/* ------------------------------------------------------ */
/*                  Token payload schema                  */
/* ------------------------------------------------------ */
const jwtPayload: joiTypes.utils.ConvertObjectToJoiType<joiTypes.jwt.definition.JwtDecode> =
    {
        id: mongooseId,
        role: Joi.string().required(),
        exp: Joi.number().required(),
        iat: Joi.number().required()
    };

export const jwtPayloadSignSchema = Joi.object<
    joiTypes.jwt.definition.JwtPayload,
    true
>(_.pick(jwtPayload, ['id', 'role']));

export const jwtDecodeSchema = Joi.object<
    joiTypes.jwt.definition.JwtDecode,
    true
>(jwtPayload).unknown(true);
