import mongoose, { GetLeanResultType, HydratedDocument, QueryWithHelpers } from 'mongoose';
import { timestamps } from '@/configs/mongoose.config.js';
import { PESSIMISTIC_QUERY_TIME } from '@/configs/redis.config.js';
import { userModel } from '@/models/user.model.js';

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

export const getProjection = <T = any>({
    projection = '',
    only = [],
    select = [],
    omit = []
}: moduleTypes.mongoose.GetProjection<T>) => {
    /* ------------------ Get metadata of omit ------------------ */
    if (omit === 'metadata') omit = ['__v', ...Object.values(timestamps)] as any;

    if (typeof projection !== 'string') {
        projection = Object.keys(projection).reduce((acc, cur) => {
            return `${acc} ${projection[cur] ? `${cur}` : `-${cur}`}`;
        }, '');
    }

    for (const field of only) {
        projection += ` ${field.toString()}`;
    }

    for (const field of select) {
        projection += ` +${field.toString()}`;
    }

    for (const field of omit) {
        projection += ` -${field.toString()}`;
    }

    projection = projection.trim();

    return projection;
};

/* -------------------- Find all wrapper -------------------- */
export const generateFindAll = <T = any>(model: any) => {
    return async ({
        query,
        omit = [],
        only = [],
        projection = {},
        options = {},
        select = []
    }: moduleTypes.mongoose.FindAll<T>) => {
        type Query = QueryWithHelpers<GetLeanResultType<T, T[], 'find'>, T, {}, T, 'find', {}>;

        projection = getProjection<T>({
            projection,
            only,
            select,
            omit
        });

        userModel.find;
        const result: Query = await model.find(query, projection, options);

        return result;
    };
};
export const generateFindAllPageSplit = <T = any>(model: any) => {
    return async ({
        query,
        options = {},
        limit = 50,
        page = 1,
        projection = '',
        only = [],
        select = [],
        omit = []
    }: moduleTypes.mongoose.FindAllWithPageSlittingArgs<T>): Promise<T[]> => {
        const skip = limit * (page - 1);

        projection = getProjection<T>({
            projection,
            select,
            omit,
            only
        });

        return await model.find(query, projection, {
            sort: { [timestamps.updatedAt]: -1 },
            skip,
            limit,
            lean: true,
            ...options
        });
    };
};

/* ------------------- Update all wrapper ------------------- */
export const generateUpdateAll = <T = any>(model: any) => {
    return async ({ query, update }: moduleTypes.mongoose.UpdateAllArgs<T>) => {
        return (
            (await model.updateMany(query, update).maxTimeMS(PESSIMISTIC_QUERY_TIME)
                .modifiedCount) > 0
        );
    };
};

export const generateFindOneAndUpdate = <T = any>(model: any) => {
    return ({
        query,
        update,
        options = {},
        projection = '',
        only = [],
        select = [],
        omit = []
    }: moduleTypes.mongoose.FindOneAndUpdate<T>) => {
        type Query = QueryWithHelpers<HydratedDocument<T>, {}, T, 'findOneAndUpdate', {}>;

        projection = getProjection<T>({
            projection,
            only,
            select,
            omit
        });

        const result: Query = model
            .findOneAndUpdate(query, update, {
                sort: options.sort === 'ctime' ? { [timestamps.updatedAt]: -1 } : options.sort,
                ...options
            })
            .select(projection)
            .maxTimeMS(PESSIMISTIC_QUERY_TIME);

        return result;
    };
};

export const generateFindOne = <T = any>(model: any) => {
    return ({
        query,
        options = {},
        only = [],
        select = [],
        omit = [],
        projection = {}
    }: moduleTypes.mongoose.FindOne<T>) => {
        type Query = QueryWithHelpers<HydratedDocument<T>, {}, T, 'findOne', {}>;

        projection = getProjection<T>({
            projection,
            only,
            select,
            omit
        });

        const result: Query = model.findOne(query, projection, options);

        return result;
    };
};

export const generateFindById = <T = any>(model: any) => {
    return ({
        id,
        options = {},
        only = [],
        select = [],
        omit = [],
        projection = {}
    }: moduleTypes.mongoose.FindById<T>) => {
        type Query = QueryWithHelpers<HydratedDocument<T>, {}, T, 'findById', {}>;

        projection = getProjection<T>({
            projection,
            only,
            select,
            omit
        });

        const result: Query = model.findById(id, projection, options);

        return result;
    };
};

export const generateFindOneAndRepalce = <T = any>(model: any) => {
    return ({
        query,
        update,
        options = {},
        projection = '',
        only = [],
        select = [],
        omit = []
    }: moduleTypes.mongoose.FindOneAndReplace<T>) => {
        type Query = QueryWithHelpers<HydratedDocument<T>, {}, T, 'findOneAndReplace', {}>;

        projection = getProjection<T>({
            projection,
            only,
            select,
            omit
        });

        const result: Query = model
            .findOneAndReplace(query, update, {
                sort: options.sort === 'ctime' ? { [timestamps.updatedAt]: -1 } : options.sort,
                ...options
            })
            .select(projection)
            .maxTimeMS(PESSIMISTIC_QUERY_TIME);

        return result;
    };
}
