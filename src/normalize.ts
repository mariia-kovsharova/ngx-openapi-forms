import { access } from 'fs';
import { ComplexDescription, EntityDescription, EntityField } from 'types/swagger-types';

type EntityType = ComplexDescription | EntityDescription | EntityField;
type DescriptionType = ComplexDescription | EntityDescription;

const isComplex = (values: EntityType): values is ComplexDescription => values.hasOwnProperty('allOf');

const isEnum = (values: EntityType) => values.hasOwnProperty('enum');

const mergeProperties = (props: EntityDescription[]) => {
  const mergedProps = props.reduce(
    (acc: EntityField, prop: EntityDescription) => ({
      ...acc,
      ...prop.properties,
    }),
    {}
  );
  return {
    type: 'object',
    properties: mergedProps,
  };
};

const normalize = (values: EntityType): EntityDescription | null => {
  if (isEnum(values)) {
    return null;
  }
  if (isComplex(values)) {
    const { allOf } = values;
    const normalizedAllOf = allOf.reduce((acc: EntityDescription[], d: DescriptionType) => {
      const value = normalize(d);
      if (value) {
        acc.push(value);
      }
      return acc;
    }, []);
    return mergeProperties(normalizedAllOf);
  }
  return values as EntityDescription;
};

export default normalize;
