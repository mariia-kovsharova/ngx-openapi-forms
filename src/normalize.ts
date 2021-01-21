import { ComplexDescription, EntityDescription, EntityField, EntityProperty } from 'types/swagger-types';

type EntityType = ComplexDescription | EntityDescription | EntityField;

type TransformFunc = (values: EntityType) => EntityDescription | null;

type Dispatcher = {
  check: (values: EntityType) => boolean;
  transform: (values: EntityType, transformFn: TransformFunc) => EntityDescription | null;
};

const plainTypes = ['string', 'boolean', 'integer', 'number'];

const isPrimitive = (values: EntityProperty) => plainTypes.includes(values.type);

const isComplex = (values: EntityType): values is ComplexDescription =>
  Object.prototype.hasOwnProperty.call(values, 'allOf');

const isPlain = (values: EntityType): values is EntityDescription =>
  Object.prototype.hasOwnProperty.call(values, 'properties');

const isEnum = (values: EntityType): boolean => Object.prototype.hasOwnProperty.call(values, 'enum');

const merge = (props: EntityDescription[]): EntityDescription => {
  const required = props.reduce((acc: string[], { required: innerReq }: EntityDescription) => {
    const value = innerReq ?? [];
    return [...acc, ...value];
  }, []);
  const properties = props.reduce(
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
  const { properties } = values;
  if (!properties) {
    throw new Error(`Object type field can not have properties, field type: ${values.type}`);
  }
  const propertyKeys = Object.keys(properties);
  const processedProperties = propertyKeys.reduce((acc: EntityField, currentPropKey: string): EntityField => {
    const property = properties[currentPropKey];
    // TODO: how to check it with isComplex predicate?
    if ('allOf' in property) {
      const flatted = fn(property);
      return { ...acc, [currentPropKey]: flatted ?? property };
    }
    return { ...acc, [currentPropKey]: property };
  }, {});
  const copiedValues = { ...values, properties: processedProperties } as EntityDescription;
  return copiedValues;
};

const complexFieldTransformer = (values: ComplexDescription, fn: TransformFunc): EntityDescription => {
  const { allOf } = values;
  const normalizedAllOf = allOf.reduce(
    (acc: EntityDescription[], allOfItem: EntityDescription | ComplexDescription) => {
      const updatedAcc = acc.slice();
      if (isComplex(allOfItem)) {
        const value = fn(allOfItem);
        if (value) {
          updatedAcc.push(value);
        }
      } else {
        const plainFieldTransformed = plainFieldTranformer(allOfItem, fn);
        updatedAcc.push(plainFieldTransformed);
      }
      return updatedAcc;
    },
    []
  );
  return merge(normalizedAllOf);
};

const typeDispatchers: Dispatcher[] = [
  {
    check: (values: EntityType) => isPrimitive(values as EntityProperty),
    transform: (_values: EntityType, _fn: TransformFunc) => null,
  },
  {
    check: (values: EntityType) => isEnum(values),
    transform: (_values: EntityType) => null,
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
  const rule: Dispatcher | undefined = typeDispatchers.find(({ check }) => check(values));
  if (rule) {
    const { transform } = rule;
    return transform(values, normalize);
  }
  throw new Error(`Unknown type of entity: ${JSON.stringify(values)}`);
};

export default normalize;
