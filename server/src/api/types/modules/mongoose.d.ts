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
            interface Metadata {
                created_at?: Date;
                updated_at?: Date;
                __v?: number;
            }

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
                (isDocument extends true ? HydratedDocument<T & D & Metadata> : {}) &
                (isModel extends false ? (isDocument extends false ? T & D : {}) : {});

            interface GetProjection<T> {
                projection: ObjectAnyKeys<number> | string;
                only: Array<keyof T>;
                select: Array<keyof T>;
                omit: Array<keyof T> | 'metadata';
            }

            /* -------------------- Generate findAll -------------------- */
            interface FindAll<T = any> extends Partial<GetProjection<T>> {
                query: RootFilterQuery<T>;
                options?: QueryOptions<T>;
            }

            /* ----- Argument of generateFindAllPageSlitting utils  ----- */
            interface FindAllWithPageSlittingArgs<T = any>
                extends Partial<GetProjection<T>>,
                    commonTypes.object.Pagination {
                query: RootFilterQuery<T>;
                options?: QueryOptions<T>;
            }

            /* --------------- Generate findOneAndUpdate  --------------- */
            interface FindOneAndUpdate<T = any> extends Partial<GetProjection<T>> {
                query: RootFilterQuery<T>;
                update: UpdateQuery<T>;
                options?: QueryOptions<T>;
            }

            /* ------------------ Find one and replace ------------------ */
            interface FindOneAndReplace<T> extends FindOneAndUpdate<T> {}

            /* -------------------- Generate findOne -------------------- */
            interface FindOne<T = any> extends Omit<FindOneAndUpdate<T>, 'update'> {}

            /* ------------------- Generate findById  ------------------- */
            interface FindById<T = any> extends Omit<FindOne<T>, 'query'> {
                id: string | mongooseBase.Types.ObjectId;
            }

            /* ---------------------------------------------------------- */
            /*                           Update                           */
            /* ---------------------------------------------------------- */
            interface FindByIdAndUpdate<T = any> extends FindById<T> {
                update: UpdateQuery<T>;
            }

            /* ------------- Arguments of generateUpdateAll ------------- */
            interface UpdateAllArgs<T = any> {
                query: RootFilterQuery<T>;
                update: Partial<T>;
            }

            /* ---------------------------------------------------------- */
            /*                           Delete                           */
            /* ---------------------------------------------------------- */

            /* ---------- Arguments of generateFindOneAndDelete --------- */
            interface FindOneAndDelete<T = any> extends FindOne<T> {}

            interface FindByIdAndDelete<T = any> extends FindById<T> {}
        }
    }

    module 'mongoose' {
        interface QueryTimestampsConfig {
            created_at?: boolean;
            updated_at?: boolean;
        }
    }
}
