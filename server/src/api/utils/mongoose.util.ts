import mongoose, { HydratedDocument, QueryWithHelpers } from 'mongoose';
import { timestamps } from '../../configs/mongoose.config.js';

export const convertToMongooseId = (id: string) => new mongoose.Types.ObjectId(id);

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
        projection = {},
        sort = {},
        limit = 50,
        page = 1,
        select = [],
        omit = []
    }: moduleTypes.mongoose.FindAllWithPageSlittingArgs<T>): Promise<T[]> => {
        const skip = limit * (page - 1);

        for (const field of select) projection[field] = 1;
        for (const field of omit) projection[field] = 0;

        return await model.find(query, projection).sort(sort).skip(skip).limit(limit).lean();
    };
};

/* ------------------- Update all wrapper ------------------- */
export const generateUpdateAll = <T = any>(model: any) => {
    return async ({ query, update }: moduleTypes.mongoose.UpdateAllArgs<T>) => {
        return (await model.updateMany(query, update).modifiedCount) > 0;
    };
};

export const generateFindOneAndUpdate = <T = any>(model: any) => {
    return ({
        query,
        update,
        options = {},
        select = [],
        omit = [],
        sort = 'ctime',
        projection = {}
    }: moduleTypes.mongoose.FindOneAndUpdate<T>) => {
        type Query = QueryWithHelpers<HydratedDocument<T>, {}, T, 'findOneAndUpdate', {}>;

        /* ------------------------- Select ------------------------- */
        for (const field of select) projection[field] = 1;

        /* -------------------------- Omit -------------------------- */
        if (omit === 'metadata') {
            const metadataField = ['__v', ...Object.values(timestamps)];

            for (const field of metadataField) projection[field] = 0;
        } else for (const field of omit) projection[field] = 0;

        const result: Query = model
            .findOneAndUpdate(query, update, options)
            .select(projection)
            .sort(sort === 'ctime' ? { [timestamps.updatedAt]: -1 } : sort);

        return result;
    };
};

export const generateFindOne = <T = any>(model: any) => {
    return ({
        query,
        options = {},
        select = [],
        omit = [],
        projection = {}
    }: moduleTypes.mongoose.FindOne<T>) => {
        type Query = QueryWithHelpers<HydratedDocument<T>, {}, T, 'findOne', {}>;

        for (const field of select) projection[field] = 1;

        if (omit === 'metadata') {
            const metadataField = ['__v', ...Object.values(timestamps)];

            for (const field of metadataField) projection[field] = 0;
        } else for (const field of omit) projection[field] = 0;

        const result: Query = model.findOne(query, projection, options);

        return result;
    };
};
