import { ObjectSchema } from 'joi';

export const toOptionalObject = <T = commonTypes.object.ObjectAnyKeys>(
    obj: T
) => {
    return Object.entries(obj as {})
        .map(([k, v]) => ({ [k]: (v as any).optional() }))
        .reduce(
            (acc, curr) => ({ ...acc, ...curr }),
            {} as Object
        ) as T extends infer U ? U : unknown;
};
