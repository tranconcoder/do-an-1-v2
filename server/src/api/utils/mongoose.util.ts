import mongoose, { HydratedDocument, Model } from 'mongoose';

export const convertToMongooseId = (id: string) =>
    new mongoose.Types.ObjectId(id);

export const addFieldToSchemaDefinition = <T, K>(schema: T, field: K) => {
    return {
        ...schema,
        ...field
    } as commonTypes.utils.AutoType<T> & commonTypes.utils.AutoType<K>;
};

export const get$SetNestedFromObject = (
    source: commonTypes.object.ObjectAnyKeys,
    target: commonTypes.object.ObjectAnyKeys,
    parent = ''
) => {
    Object.keys(source).forEach((k) => {
        const targetKey = parent === '' ? k : `${parent}.${k}`;

        if (source[k] instanceof Object && !Array.isArray(source[k])) {
            get$SetNestedFromObject(source[k], target, targetKey);
        } else {
            target[targetKey] = source[k];
        }
    });
};

export const omitFields = <T = string>(fields: T[]) => {
    const results: commonTypes.object.ObjectAnyKeys = {};

    fields.forEach((field) => {
        results[field as string] = 0;
    });

    return results;
};

/* -------------------- Find all wrapper -------------------- */
export const generateFindAllPageSplit = <T = any>(model: any) => {
    return async ({
        query,
        sort = {},
        limit = 50,
        page = 1,
        select = [],
        omit = []
    }: moduleTypes.mongoose.FindAllWithPageSlittingArgs<T>): Promise<T[]> => {
        const projection: commonTypes.object.ObjectAnyKeys = {};
        const skip = limit * (page - 1);

        for (const field of select) projection[field] = 1;
        for (const field of omit) projection[field] = 0;

        return await model
            .find(query, projection)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
    };
};
