import { generateFindById, generateFindOne } from '@/utils/mongoose.util.js';
import { userModel } from '@/models/user.model.js';
import { getUserProfile, setUserProfile } from '@/services/redis.service.js';

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */

const findByIdLocal = generateFindById<modelTypes.auth.UserSchema>(userModel);

/* -------------------- Find user by id  -------------------- */
export const findUserById = async ({
    ...payload
}: moduleTypes.mongoose.FindById<modelTypes.auth.UserSchema>) => {
    /* ---------------------- Redis check  ---------------------- */
    const redisUser = await getUserProfile(payload.id.toString());
    if (redisUser) return redisUser;

    const user = await findByIdLocal({ ...payload }).lean();

    /* ----------------- Save profile to redis  ----------------- */
    setUserProfile({ id: payload.id.toString(), ...user });

    return user;
};

generateFindById<modelTypes.auth.UserSchema>(userModel);

/* --------------------- Find one user  --------------------- */
export const findOneUser = generateFindOne<modelTypes.auth.UserSchema>(userModel);
