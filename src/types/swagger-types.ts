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

export type EntityField = { [key: string]: EntityProperty };

export type EntityDescription = {
  type: string;
  properties: EntityField;
  required?: string[];
};

export type ComplexDescription = {
  allOf: (EntityDescription | ComplexDescription)[];
};

export type Entity = [string, ComplexDescription | EntityDescription | EntityField];
