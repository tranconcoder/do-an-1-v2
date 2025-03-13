import type mongooseBase from 'mongoose';
import mongoose, { HydratedDocument, Models } from 'mongoose';
import mongooseLib, { Document, model, Model } from 'mongoose';

declare global {
    namespace moduleTypes {
        namespace mongoose {
            type ObjectId = mongooseBase.Types.ObjectId | string;

            type ConvertObjectIdToString<T> = {
                [K in keyof T]: T[K] extends mongooseBase.Types.ObjectId
                    ? string
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
                query: Partial<T>;
                limit?: number;
                page?: number;
                select?: string[];
                omit?: string[];
            }
        }
    }
}
