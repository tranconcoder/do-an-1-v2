import {
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';
import { userModel } from '@/models/user.model.js';
import { getUserProfile, setUserProfile } from '@/services/redis.service.js';

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */

const findById = generateFindById<model.auth.UserSchema>(userModel);

/* -------------------- Find user by id  -------------------- */
export const findUserById = async ({
    ...payload
}: moduleTypes.mongoose.FindById<model.auth.UserSchema>) => {
    /* ---------------------- Redis check  ---------------------- */
    const redisUser = await getUserProfile(payload.id.toString());
    if (redisUser) return redisUser;

    const user = await findById({ ...payload }).lean();

    /* ----------------- Save profile to redis  ----------------- */
    setUserProfile({ id: payload.id.toString(), ...user });

    return user;
};

/* --------------------- Find one user  --------------------- */
export const findOneUser = generateFindOne<model.auth.UserSchema>(userModel);

/* ------------------- Find one and update ------------------ */
export const findOneAndUpdateUser = generateFindOneAndUpdate<model.auth.UserSchema>(userModel);
