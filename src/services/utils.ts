import { ArrayDefinition, DataType, MergedDefinition, ObjectDefinition, PlainDefinition, PrimitiveDataType, SchemaDefinition } from '../contracts/ngx-openapi-types';

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

export const isPrimitiveDataType = (value: DataType): value is PrimitiveDataType => {
    return value !== DataType.Array && value !== DataType.Object;
}

export const isMergedDefinition = (schema: SchemaDefinition): schema is MergedDefinition => {
    return !!(schema as MergedDefinition).allOf;
}

export const isPrimitive = (schema: SchemaDefinition): boolean => {
    return !isMergedDefinition(schema) && isPrimitiveDataType(schema.type);
}

export const isEnum = (schema: SchemaDefinition): boolean => {
    return !!(schema as PlainDefinition).enum;
}

export const isObjectDefinition = (schema: SchemaDefinition): schema is ObjectDefinition => {
    return !isMergedDefinition(schema) && schema.type === DataType.Object;
}

export const isArrayDefinition = (schema: SchemaDefinition): schema is ArrayDefinition => {
    return !isMergedDefinition(schema) && schema.type === DataType.Array;
}