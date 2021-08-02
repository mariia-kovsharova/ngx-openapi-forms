import { OpenAPIV3 } from 'openapi-types';
import {
    ArrayDefinition, DataType, NonArrayDataType,
    ObjectDefinition, PlainDefinition, PrimitiveDataType,
    Property, Schema
} from '../contracts/ngx-openapi-types';

type OpenApiType = (OpenAPIV3.ArraySchemaObject | OpenAPIV3.NonArraySchemaObject)['type'];
type MappingFn = (from: OpenAPIV3.SchemaObject) => Schema;

const objectMapper: MappingFn = (from: OpenAPIV3.SchemaObject): ObjectDefinition => {
    return {
        type: DataType.Object,
        properties: (from.properties as Property) ?? {},
        requiredFields: from.required ?? []
    }
};

const arrayMapper: MappingFn = (from: OpenAPIV3.SchemaObject): ArrayDefinition => {
    const cast = from as OpenAPIV3.ArraySchemaObject;
    return {
        type: DataType.Array,
        items: cast.items as Array<NonArrayDataType>
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
        defaultValue: from.default
    }
}

const dispatcher = (fromType: OpenApiType): MappingFn | never => {
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
            throw new Error(`Can not process OpenApi type: ${fromType}`);
    }
};

export default (from: OpenAPIV3.SchemaObject): Schema => {
    const mappingFn = dispatcher(from.type);
    return mappingFn(from);
};

