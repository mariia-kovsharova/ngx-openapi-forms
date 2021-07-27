import {
  ObjectDefinition, PlainDefinition, ArrayDefinition,
  PrimitiveDataType, DataType, MergedDefinition, Schema
} from 'contracts/ngx-openapi-types';

const isPrimitiveDataType = (value: DataType): value is PrimitiveDataType => {
  return value !== DataType.Array && value !== DataType.Object;
}

const isMergedDefinition = (schema: Schema): schema is MergedDefinition => {
  return !!(schema as MergedDefinition).allOf;
}

const isPrimitive = (schema: Schema): boolean => {
  return !isMergedDefinition(schema) && isPrimitiveDataType(schema.type);
}

const isEnum = (schema: Schema): boolean => {
  return !!(schema as PlainDefinition).enum;
}

const isObjectDefinition = (schema: Schema): schema is ObjectDefinition => {
  return !isMergedDefinition(schema) && schema.type === DataType.Object;
}

const isArrayDefinition = (schema: Schema): schema is ArrayDefinition => {
  return !isMergedDefinition(schema) && schema.type === DataType.Array;
}

type SchemaMapper = {
  check: (schema: Schema) => boolean;
  transform: (schema?: Schema) => ObjectDefinition | null;
};

const mergeObjectDefinitions = (objDefinitions: ReadonlyArray<ObjectDefinition>): ObjectDefinition => {
  const definition = <ObjectDefinition>{
    type: DataType.Object,
    properties: {},
    requiredFields: []
  };

  return objDefinitions.reduce((def, currentObjDef) => {
    const props = { ...(def.properties ?? {}), ...(currentObjDef.properties ?? {}) };
    const requiredFields = [...(def.requiredFields ?? []), ...(currentObjDef.requiredFields ?? [])];

    def.properties = props;
    def.requiredFields = requiredFields;

    return def;
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
  }, <Array<ObjectDefinition>>[]);

  return mergeObjectDefinitions(flattedDefinitions);
}

const processObjectDefinition = (definition: ObjectDefinition): ObjectDefinition => {
  const { properties } = definition;
  const names = Object.keys(properties ?? []);


}

const plainFieldTranformer = (values: ObjectDefinition, fn: TransformFunction): ObjectDefinition => {
  const { properties: initialProperties } = values;
  if (!initialProperties) {
    throw new Error(`Object type field can not have properties, field type: ${values.type}`);
  }
  const proprertyNames = Object.keys(initialProperties);
  const properties = proprertyNames.reduce((processedField: EntityField, propertyName: string): EntityField => {
    const initialProperty = initialProperties[propertyName];
    // TODO: how to check it with isComplex predicate?
    if ('allOf' in initialProperty) {
      const flatted = fn(initialProperty);
      return { ...processedField, [propertyName]: flatted ?? initialProperty };
    }
    return { ...processedField, [propertyName]: initialProperty };
  }, {});
  return { ...values, properties };
};



const mappers: SchemaMapper[] = [
  {
    check: (schema: Schema) => isPrimitive(schema) || isEnum(schema),
    transform: () => null,
  },
  {
    check: (schema: Schema) => isMergedDefinition(schema),
    transform: (schema: Schema) => processMergedDefinition(schema as MergedDefinition),
  },
  {
    check: (schema: Schema) => isObjectDefinition(schema),
    transform: (schema: Schema) => null,
  }
];



const normalize = (entity: Schema): ObjectDefinition | null | never => {

  // const transformationRule = typeDispatchers.find(({ check }) => check(values));
  // if (transformationRule) {
  //   const { transform } = transformationRule;
  //   return transform(values, normalize);
  // }

  // throw new Error(`Unknown type of entity: ${JSON.stringify(entity)}`);

  // const rule = mappers.find(({ check }) => check(entity));

  console.log(JSON.stringify(entity));

};

export default normalize;
