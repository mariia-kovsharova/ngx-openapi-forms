import { ComplexDescription, EntityDescription, EntityField, EntityProperty } from 'types/swagger-types';

type EntityType = ComplexDescription | EntityDescription | EntityField;

type TransformFunc = (values: EntityType) => EntityDescription | null;

type Dispatcher = {
  check: (values: EntityType) => boolean;
  transform: (values: EntityType, transformFn: TransformFunc) => EntityDescription | null;
};

const primitiveSwaggerTypes = ['string', 'boolean', 'integer', 'number'];

const isPrimitive = (values: EntityProperty) => primitiveSwaggerTypes.includes(values.type);

const isComplex = (values: EntityType): values is ComplexDescription =>
  Object.prototype.hasOwnProperty.call(values, 'allOf');

const isPlain = (values: EntityType): values is EntityDescription =>
  Object.prototype.hasOwnProperty.call(values, 'properties');

const isEnum = (values: EntityType): boolean => Object.prototype.hasOwnProperty.call(values, 'enum');

const mergeProperties = (initialProperties: EntityDescription[]): EntityDescription => {
  const required = initialProperties.reduce((acc: string[], { required: innerReq }: EntityDescription) => {
    const value = innerReq ?? [];
    return [...acc, ...value];
  }, []);
  const properties = initialProperties.reduce(
    (acc: EntityField, { properties: innerProp }: EntityDescription) => ({ ...acc, ...innerProp }),
    {}
  );
  return {
    type: 'object',
    properties,
    required,
  };
};

const plainFieldTranformer = (values: EntityDescription, fn: TransformFunc): EntityDescription => {
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

const complexFieldTransformer = (values: ComplexDescription, fn: TransformFunc): EntityDescription => {
  const { allOf } = values;
  const normalizedData = allOf.reduce(
    (acc: EntityDescription[], allOfItem: EntityDescription | ComplexDescription): EntityDescription[] => {
      const value = isComplex(allOfItem) ? fn(allOfItem) : plainFieldTranformer(allOfItem, fn);
      return value ? [...acc, value] : acc;
    },
    []
  );
  return mergeProperties(normalizedData);
};

const typeDispatchers: Dispatcher[] = [
  {
    check: (values: EntityType) => isPrimitive(values as EntityProperty) || isEnum(values),
    transform: (_values: EntityType, _fn: TransformFunc) => null,
  },
  {
    check: (values: EntityType) => isComplex(values),
    transform: (values: EntityType, fn: TransformFunc) => complexFieldTransformer(values as ComplexDescription, fn),
  },
  {
    check: (values: EntityType) => isPlain(values),
    transform: (values: EntityType, fn: TransformFunc) => plainFieldTranformer(values as EntityDescription, fn),
  },
];

const normalize = (values: EntityType): EntityDescription | null => {
  const transformationRule: Dispatcher | undefined = typeDispatchers.find(({ check }) => check(values));
  if (transformationRule) {
    const { transform } = transformationRule;
    return transform(values, normalize);
  }
  throw new Error(`Unknown type of entity: ${JSON.stringify(values)}`);
};

export default normalize;
