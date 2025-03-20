import type { ArraySchema, BooleanSchema, DateSchema, NumberSchema, StringSchema } from 'joi';

declare global {
    namespace joiTypes {
        interface PageSplitting {
            limit?: number;
            page?: number;
        }

        namespace utils {
            type ConvertObjectToJoiType<T> = {
                [K in keyof T]: T[K] extends string
                    ? StringSchema
                    : T[K] extends number
                      ? NumberSchema
                      : T[K] extends Date
                        ? DateSchema
                        : T[K] extends boolean
                          ? BooleanSchema
                          : T[K] extends Array
                            ? ArraySchema
                            : never;
            };
        }
    }
}
