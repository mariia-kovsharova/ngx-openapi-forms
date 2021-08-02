export const isNil = (value: unknown): value is null | undefined => {
    return value === null || value === undefined;
}

export const isString = (value: unknown): value is string => {
    return typeof value === 'string';
}

export function hasPresentKey<K extends string | number | symbol>(k: K) {
    return function <T, V>(
        a: T & { [k in K]?: V | null }
    ): a is T & { [k in K]: V } {
        return !isNil(a[k]);
    };
}