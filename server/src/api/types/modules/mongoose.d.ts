import type mongooseBase from 'mongoose';
import type {
    HydratedDocument,
    Models,
    ProjectionType,
    QueryOptions,
    QueryWithHelpers,
    RootFilterQuery,
    UpdateQuery
} from 'mongoose';
import mongooseLib, { Document, model, Model } from 'mongoose';

declare global {
    namespace moduleTypes {
        namespace mongoose {
            type ObjectId = mongooseBase.Types.ObjectId | string;

            type ConvertObjectIdToString<T> = {
                [K in keyof T]: NonNullable<T[K]> extends ObjectId
                    ? string
                    : NonNullable<T[K]> extends mongooseBase.Types.ObjectId
                      ? string
                      : NonNullable<T[K]> extends ObjectId[]
                        ? string[]
                        : NonNullable<T[K]> extends mongooseBase.Types.ObjectId[]
                          ? string[]
                          : T[K];
            };

            type IsModel<T = false, K = any> = T extends true
                ? mongooseLib.Model<{}, {}, {}, {}, HydratedDocument<K>>
                : {};

            type MongooseType<T, isModel, isDocument, D> = (isModel extends true
                ? Model<{}, {}, {}, {}, HydratedDocument<T & D>>
                : {}) &
                (isDocument extends true ? HydratedDocument<T & D> : {}) &
                (isModel extends false ? (isDocument extends false ? T & D : {}) : {});

            /* ----- Argument of generateFindAllPageSlitting utils  ----- */
            interface FindAllWithPageSlittingArgs<T = any> {
                query: RootFilterQuery<T>;
                projection?: ProjectionType;
                sort?: any;
                limit?: number;
                page?: number;
                select?: Array<keyof T>;
                omit?: Array<keyof T>;
            }

            /* ------------- Arguments of generateUpdateAll ------------- */
            interface UpdateAllArgs<T = any> {
                query: RootFilterQuery<T>;
                update: Partial<T>;
            }

            /* --------------- Generate findOneAndUpdate  --------------- */
            interface FindOneAndUpdate<T = any> {
                query: RootFilterQuery<T>;
                update: UpdateQuery<T>;
                options?: QueryOptions<T>;
                projection?: ProjectionType;
                sort?: any;
                select?: Array<keyof T>;
                omit?: Array<keyof T> | 'metadata';
            }

            /* -------------------- Generate findOne -------------------- */
            interface FindOne<T = any> extends Omit<FindOneAndUpdate<T>, 'update'> {}
        }
    }

    module 'mongoose' {
        interface QueryTimestampsConfig {
            created_at?: boolean;
            updated_at?: boolean;
        }
    }
}
