import { ComplexDescription, EntityDescription, EntityField } from 'types/swagger-types';

type EntityType = ComplexDescription | EntityDescription | EntityField;
type DescriptionType = ComplexDescription | EntityDescription;

const isComplex = (values: EntityType): values is ComplexDescription =>
  Object.prototype.hasOwnProperty.call(values, 'allOf');

const isEnum = (values: EntityType) => Object.prototype.hasOwnProperty.call(values, 'enum');

const merge = (props: EntityDescription[]) => {
  const required = props.reduce(
    (acc: string[], { required: innerReq }: EntityDescription) => [...acc, ...(innerReq ?? [])],
    []
  );
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

const normalize = (values: EntityType): EntityDescription | null => {
  const normalizeReducer = (acc: EntityDescription[], d: DescriptionType): EntityDescription[] => {
    const value = normalize(d);
    if (value) {
      acc.push(value);
    }
    return acc;
  };

  if (isEnum(values)) {
    return null;
  }
  if (isComplex(values)) {
    const { allOf } = values;
    const normalizedAllOf = allOf.reduce(normalizeReducer, []);
    return merge(normalizedAllOf);
  }
  return values as EntityDescription;
};

export default normalize;
