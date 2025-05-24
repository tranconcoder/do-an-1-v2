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
    setUserProfile({
        _id: user._id.toString(),
        user_fullName: user.user_fullName,
        user_email: user.user_email,
        phoneNumber: user.phoneNumber,
        user_role: user.user_role,
        user_avatar: user.user_avatar,
        user_sex: user.user_sex,
        user_status: user.user_status,
        user_dayOfBirth: user.user_dayOfBirth,
    });

    return user;
};

/* --------------------- Find one user  --------------------- */
export const findOneUser = generateFindOne<model.auth.UserSchema>(userModel);

/* ------------------- Find one and update ------------------ */
export const findOneAndUpdateUser = generateFindOneAndUpdate<model.auth.UserSchema>(userModel);
