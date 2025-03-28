import keyTokenModel from '@/models/keyToken.model.js';
import { getKeyToken, setKeyToken } from '@/services/redis.service.js';
import { generateFindById } from '@/utils/mongoose.util.js';

/* ----------------------- Find by id ----------------------- */
const findById = generateFindById<model.keyToken.KeyTokenSchema>(keyTokenModel);
const findOneAndReplace = generateFindOneAndReplace<model.keyToken.KeyTokenSchema>(keyTokenModel);

export const findKeyTokenById = async (id: string) => {
    let keyToken = await getKeyToken(id);

    if (!keyToken) {
        keyToken = await findById({ id });
        console.log(keyToken);
        await setKeyToken(keyToken);
    }

    return keyToken;
};

export const find 
