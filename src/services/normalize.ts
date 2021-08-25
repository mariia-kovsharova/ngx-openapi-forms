import {
  ObjectDefinition, PlainDefinition, PrimitiveDataType,
  DataType, MergedDefinition, Schema, ArrayDefinition
} from '../contracts/ngx-openapi-types';

type SchemaDefinition = Schema | MergedDefinition;

const isPrimitiveDataType = (value: DataType): value is PrimitiveDataType => {
  return value !== DataType.Array && value !== DataType.Object;
}

const isMergedDefinition = (schema: SchemaDefinition): schema is MergedDefinition => {
  return !!(schema as MergedDefinition).allOf;
}

const isPrimitive = (schema: SchemaDefinition): boolean => {
  return !isMergedDefinition(schema) && isPrimitiveDataType(schema.type);
}

const isEnum = (schema: SchemaDefinition): boolean => {
  return !!(schema as PlainDefinition).enum;
}

const isObjectDefinition = (schema: SchemaDefinition): schema is ObjectDefinition => {
  return !isMergedDefinition(schema) && schema.type === DataType.Object;
}

const isArrayDefinition = (schema: SchemaDefinition): schema is ArrayDefinition => {
  return !isMergedDefinition(schema) && schema.type === DataType.Array;
}

type SchemaMapper = {
  check: (schema: SchemaDefinition) => boolean;
  transform: (schema: SchemaDefinition) => ObjectDefinition | null;
};

const mergeDefinitions = (definitions: ReadonlyArray<Schema>): ObjectDefinition => {
  const definition = <ObjectDefinition>{
    type: DataType.Object,
    properties: {},
    requiredFields: [],
    isGroup: true
  };

  return definitions.reduce((acc: ObjectDefinition, currentDefinition: Schema) => {
    if (!isObjectDefinition(currentDefinition)) {
      return acc;
    }

    const props = { ...acc.properties, ...currentDefinition.properties };
    const requiredFields = [...acc.requiredFields, ...currentDefinition.requiredFields];

    acc.properties = props;
    acc.requiredFields = requiredFields;

    return acc;
  }, definition);
}

const processMergedDefinition = (definition: MergedDefinition): ObjectDefinition => {
  const { allOf } = definition;

  const flattedDefinitions = allOf.reduce((acc, innerDef) => {
    if (isMergedDefinition(innerDef)) {
      const norm = normalize(innerDef);
      norm && acc.push(norm);
    } else {
      acc.push(innerDef);
    }
    return acc;
  }, <Array<Schema>>[]);

  return mergeDefinitions(flattedDefinitions);
}

const processObjectDefinition = (definition: ObjectDefinition): ObjectDefinition => {
  const { properties } = definition;
  const names = Object.keys(properties);

  const props = names.reduce((acc, name) => {
    const value = properties[name];

    if (isMergedDefinition(value)) {
      const flatted = normalize(value);
      return flatted ? ({ ...acc, [name]: flatted.properties }) : acc;
    } else {
      return ({ ...acc, [name]: value })
    }
  }, {});

  return <ObjectDefinition>{
    type: DataType.Object,
    properties: props
  }
}

const mappers: SchemaMapper[] = [
  {
    check: (schema: SchemaDefinition) => isPrimitive(schema) || isEnum(schema) || isArrayDefinition(schema),
    transform: () => null,
  },
  {
    check: (schema: SchemaDefinition) => isMergedDefinition(schema),
    transform: (schema: SchemaDefinition) => processMergedDefinition(schema as MergedDefinition),
  },
  {
    check: (schema: SchemaDefinition) => isObjectDefinition(schema),
    transform: (schema: SchemaDefinition) => processObjectDefinition(schema as ObjectDefinition),
  }
];

const normalize = (entity: SchemaDefinition): ObjectDefinition | null | never => {
  const rule = mappers.find(({ check }) => check(entity));
  if (rule) {
    const { transform } = rule;
    return transform(entity);
  }

  throw new Error(`Normalize rules not found for entity: ${JSON.stringify(entity)}`);
};

export default normalize;
