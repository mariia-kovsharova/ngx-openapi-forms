export type EntityProperty = {
  type: string;
  format?: string;
  pattern?: string;
  min?: number;
  max?: number;
  readOnly?: boolean;
  writeOnly?: boolean;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
};

/* eslint-disable */
export type EntityField = { [key: string]: EntityProperty | EntityDescription };

export type EntityDescription = {
  type: string;
  properties?: EntityField;
  required?: string[];
};

export type ComplexDescription = {
  allOf: (EntityDescription | ComplexDescription)[];
};

type EntityValue = ComplexDescription | EntityDescription | EntityField;

export type Entity = [string, EntityValue];
