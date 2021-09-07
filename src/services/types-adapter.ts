import { OpenAPIV3 } from 'openapi-types';
import {
    ArrayDefinition, DataType, MergedDefinition, NonArrayDataType,
    ObjectDefinition, PlainDefinition, PrimitiveDataType,
    Property, Schema
} from '../contracts/ngx-openapi-types';
import { isNil } from './utils';

type OpenApiType = (OpenAPIV3.ArraySchemaObject | OpenAPIV3.NonArraySchemaObject)['type'];
type MappingFn = (from: OpenAPIV3.SchemaObject) => Schema | MergedDefinition;

const objectMapper: MappingFn = (from: OpenAPIV3.SchemaObject): ObjectDefinition => {
    return {
        type: DataType.Object,
        properties: (from.properties as Property) ?? {},
        requiredFields: from.required ?? [],
        isGroup: true
    }
};

const arrayMapper: MappingFn = (from: OpenAPIV3.SchemaObject): ArrayDefinition => {
    const cast = from as OpenAPIV3.ArraySchemaObject;
    return {
        type: DataType.Array,
        items: cast.items as Array<NonArrayDataType>,
        isGroup: false
    }
};

const plainMapper: MappingFn = (from: OpenAPIV3.SchemaObject): PlainDefinition => {
    return {
        type: from.type! as PrimitiveDataType,
        format: from.format,
        pattern: from.pattern,
        minValue: from.minimum,
        maxValue: from.maximum,
        minLength: from.minLength,
        maxLength: from.maxLength,
        readOnly: from.readOnly,
        default: from.default,
        isGroup: false
    }
}

const complexMapper: MappingFn = (from: OpenAPIV3.SchemaObject): MergedDefinition | never => {
    const mappedAllOf = from.allOf?.map(x => {
        const type = (x as OpenAPIV3.SchemaObject).type;

        const mappingFn = typeDispatcher(type) ?? complexDispatcher(from);
        if (isNil(mappingFn)) {
            throw new Error(`Can not map schema: ${JSON.stringify(from)}`);
        }
        return mappingFn(x as OpenAPIV3.SchemaObject) as ObjectDefinition;
    }) ?? [];

    return {
        type: DataType.Object,
        isGroup: true,
        allOf: mappedAllOf
    }
}

const typeDispatcher = (fromType: OpenApiType): MappingFn | null => {
    switch (fromType) {
        case DataType.Object:
            return objectMapper;
        case DataType.Array:
            return arrayMapper;
        case DataType.Boolean:
        case DataType.Integer:
        case DataType.String:
            return plainMapper;
        default:
            return null;
    }
};

const complexDispatcher = (from: OpenAPIV3.SchemaObject): MappingFn | null => {
    return isNil(from.allOf) ? null : complexMapper;
}

export default (from: OpenAPIV3.SchemaObject): Schema | MergedDefinition | never => {
    const mappingFn = complexDispatcher(from) ?? typeDispatcher(from.type);
    if (!mappingFn) {
        throw new Error(`Can not find mapping function for: ${JSON.stringify(from)}`);
    }
    return mappingFn(from);
};

