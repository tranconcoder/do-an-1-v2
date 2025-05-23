import keyTokenModel from '@/models/keyToken.model.js';
import { deleteKeyToken, getKeyToken, setKeyToken } from '@/services/redis.service.js';
import {
    generateFindById,
    generateFindOneAndReplace,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';

/* ----------------------- Find by id ----------------------- */
const findById = generateFindById<model.keyToken.KeyTokenSchema>(keyTokenModel);
const findOneAndReplace = generateFindOneAndReplace<model.keyToken.KeyTokenSchema>(keyTokenModel);
const findOneAndUpdate = generateFindOneAndUpdate<model.keyToken.KeyTokenSchema>(keyTokenModel);

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
export const findKeyTokenById = async (id: string) => {
    let keyToken = await getKeyToken(id);

    if (!keyToken) keyToken = await findById({ id });
    if (!keyToken) return null;

    await setKeyToken(keyToken);

    return keyToken;
};

export const findOneAndReplaceKeyToken = async (
    payload: Parameters<typeof findOneAndReplace>[number]
) => {
    const keyToken = await findOneAndReplace(payload);

    /* --------------------- Save to redis  --------------------- */
    await setKeyToken({
        ...keyToken.toObject(),
        user: keyToken.user.toString()
    });

    return keyToken;
};

export const findOneAndUpdateKeyToken = async (
    payload: moduleTypes.mongoose.FindOneAndUpdate<model.keyToken.KeyTokenSchema>
) => {
    const keyTokenUpdated = await findOneAndUpdate(payload);

    await setKeyToken({
        ...keyTokenUpdated.toObject(),
        user: keyTokenUpdated.user.toString()
    });

    return keyTokenUpdated;
};

/* ---------------------------------------------------------- */
/*                         Find many                          */
/* ---------------------------------------------------------- */

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
export const deleteOneKeyToken = async (userId: string) => {
    await keyTokenModel.deleteOne({ user: userId });
    await deleteKeyToken(userId);
};
