import { generateFindById, generateFindOne } from '@/utils/mongoose.util.js';
import { userModel } from '@/models/user.model.js';

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */

/* -------------------- Find user by id  -------------------- */
export const findUserById = generateFindById<modelTypes.auth.UserSchema>(userModel);

/* --------------------- Find one user  --------------------- */
export const findOneUser = generateFindOne<modelTypes.auth.UserSchema>(userModel);
