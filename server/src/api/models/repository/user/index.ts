import { generateFindById, generateFindOne } from '@/utils/mongoose.util.js';
import { userModel } from '@/models/user.model.js';

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */

const findByIdLocal = generateFindById<modelTypes.auth.UserSchema>(userModel);

/* -------------------- Find user by id  -------------------- */
export const findUserById = async ({
    ...payload
}: moduleTypes.mongoose.FindById<modelTypes.auth.UserSchema>) => {
    /* ---------------------- Redis check  ---------------------- */

    findByIdLocal({
        ...payload
    });
};

generateFindById<modelTypes.auth.UserSchema>(userModel);

/* --------------------- Find one user  --------------------- */
export const findOneUser = generateFindOne<modelTypes.auth.UserSchema>(userModel);
