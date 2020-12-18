export type Entity = [key: string, value: ComplexDescription | EntityDescription | EntityField];

export type ComplexDescription = {
  allOf: (EntityDescription | ComplexDescription)[];
};

export type EntityDescription = {
  type: string;
  properties: EntityField;
  required?: string[];
};

export type EntityField = { [key: string]: EntityProperty };

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
