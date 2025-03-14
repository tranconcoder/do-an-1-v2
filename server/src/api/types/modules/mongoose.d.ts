import type mongooseBase from 'mongoose';
import mongoose, {
    HydratedDocument,
    Models,
    ProjectionType,
    QueryOptions,
    QueryWithHelpers,
    RootFilterQuery
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
                        : NonNullable<
                                T[K]
                            > extends mongooseBase.Types.ObjectId[]
                          ? string[]
                          : T[K];
            };

            type IsModel<T = false, K = any> = T extends true
                ? mongooseLib.Model<{}, {}, {}, {}, HydratedDocument<K>>
                : {};

            type MongooseType<T, isModel, isDocument> = (isModel extends true
                ? Model<{}, {}, {}, {}, HydratedDocument<T>>
                : {}) &
                (isDocument extends true ? HydratedDocument<T> : {}) &
                (isModel extends false
                    ? isDocument extends false
                        ? T
                        : {}
                    : {});

            /* ----- Argument of generateFindAllPageSlitting utils  ----- */
            interface FindAllWithPageSlittingArgs<T = any> {
                query: RootFilterQuery<T>;
                projection?: ProjectionType;
                sort?: any;
                limit?: number;
                page?: number;
                select?: string[];
                omit?: string[];
            }

            /* ------------- Arguments of generateUpdateAll ------------- */
            interface UpdateAllArgs<T = any> {
                query: RootFilterQuery<T>;
                update: Partial<T>;
            }
        }
    }

    module 'mongoose' {
        interface QueryTimestampsConfig {
            created_at?: boolean;
            updated_at?: boolean;
        }
    }
}
