import type { ArraySchema, BooleanSchema, DateSchema, NumberSchema, StringSchema } from 'joi';

declare global {
    namespace joiTypes {
        interface PageSplitting {
            limit?: number;
            page?: number;
        }

        namespace utils {
            type ConvertObjectToJoiType<T> = {
                [K in keyof T]: NonNullable<T[K]> extends string
                    ? StringSchema
                    : NonNullable<T[K]> extends number
                      ? NumberSchema
                      : NonNullable<T[K]> extends Date
                        ? DateSchema
                        : NonNullable<T[K]> extends boolean
                          ? BooleanSchema
                          : NonNullable<T[K]> extends Array
                            ? ArraySchema<T[K]>
                            : never;
            };
        }
    }
}
