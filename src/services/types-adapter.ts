import { OpenAPIV3 } from 'openapi-types';
import {
    ArrayDefinition, DataType, MergedDefinition, NonArrayDataType,
    ObjectDefinition, PlainDefinition, PrimitiveDataType,
    Property, Schema
} from '../contracts/ngx-openapi-types';
import { isMergedDefinition, isNil } from './utils';

type OpenApiType = (OpenAPIV3.ArraySchemaObject | OpenAPIV3.NonArraySchemaObject)['type'];
type MappingFn = (from: OpenAPIV3.SchemaObject) => Schema | MergedDefinition;

const objectMapper: MappingFn = (from: OpenAPIV3.SchemaObject): ObjectDefinition => {
    const properties = (from.properties as Property) ?? {};
    // TODO: should we process this fields?
    // const mappedProperties = Object.keys(properties).reduce(
    //     (acc: Property, currentProperty: string) => {
    //         const value = properties[currentProperty];
    //         const mapper = getMapper(value as OpenAPIV3.SchemaObject);
    //         const transformedValue = mapper(value as OpenAPIV3.SchemaObject);

    //         if (isMergedDefinition(transformedValue)) {
    //             throw new Error(`Schema can not be complex! Shema: ${JSON.stringify(value)}`);
    //         }

    //         acc[currentProperty] = transformedValue;
    //         return acc;
    //     },
    //     <Property>{}
    // )

    return {
        type: DataType.Object,
        properties: properties,
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
        minimum: from.minimum,
        maximum: from.maximum,
        minLength: from.minLength,
        maxLength: from.maxLength,
        readOnly: from.readOnly,
        default: from.default,
        isGroup: false
    }
}

const complexMapper: MappingFn = (from: OpenAPIV3.SchemaObject): MergedDefinition | never => {
    const mappedAllOf = from.allOf?.map(x => {
        const mapper = getMapper(x as OpenAPIV3.SchemaObject);
        return mapper(x as OpenAPIV3.SchemaObject) as ObjectDefinition;
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
        case DataType.Number:
        case DataType.String:
            return plainMapper;
        default:
            return null;
    }
};

const complexDispatcher = (from: OpenAPIV3.SchemaObject): MappingFn | null => {
    if (!isNil(from.allOf) && (isNil(from.type) || from.type === DataType.Object)) {
        return complexMapper;
    }
    return null;
}

const getMapper = (from: OpenAPIV3.SchemaObject): MappingFn => {
    const mappingFn = complexDispatcher(from) ?? typeDispatcher(from.type);

    if (isNil(mappingFn)) {
        throw new Error(`Can not map schema: ${JSON.stringify(from)}`);
    }

    return mappingFn;
}

export default (from: OpenAPIV3.SchemaObject): Schema | MergedDefinition | never => {
    const mapper = getMapper(from);
    return mapper(from);
};

