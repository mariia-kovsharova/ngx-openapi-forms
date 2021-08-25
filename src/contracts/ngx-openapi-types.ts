export type DefaultValueType = string | number | boolean | null;

export enum DataType {
  Object = 'object',
  Array = 'array',
  String = 'string',
  Boolean = 'boolean',
  Integer = 'integer',
  Number = 'number'
}

export type PrimitiveDataType = DataType.Boolean | DataType.String | DataType.Integer;
export type ArrayDataType = DataType.Array;
export type NonArrayDataType = PrimitiveDataType | DataType.Object;

export type Definition = {
  enum?: Array<unknown>;
  format?: string;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
  readOnly?: boolean;
  writeOnly?: boolean;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  default?: DefaultValueType;
  isGroup: boolean;
};

export type PlainDefinition = Definition & {
  type: PrimitiveDataType;
}

export type ObjectDefinition = Definition & {
  type: DataType.Object;
  properties: Property;
  requiredFields: Array<string>;
};

export type ArrayDefinition = Definition & {
  type: DataType.Array,
  items?: NonArrayDataType[];
}

export type Schema = PlainDefinition | ObjectDefinition | ArrayDefinition;

export type NonArrayDefinition = PlainDefinition | ObjectDefinition;

export type MergedDefinition = Definition & {
  type: DataType.Object | DataType.String | DataType.Boolean | DataType.Integer,
  allOf: Array<Schema | MergedDefinition>
}

export type Property = {
  [name: string]: Schema
}

export interface ObjectEntity {
  name: string;
  value: ObjectDefinition;
};

export interface ArrayEntity {
  name: string;
  value: ArrayDefinition;
};

export interface PlainEntity {
  name: string;
  value: PlainDefinition;
};

// TODO: check why 
// export type Entity = ObjectEntity | ArrayEntity | PlainEntity;
export type Entity = {
  name: string;
  value: ObjectDefinition | ArrayDefinition | PlainDefinition;
};

type Keys<T> = keyof (Required<T>);
type Values<T> = (Required<T>)[keyof T];

export type DefinitionKeys = Keys<Definition>;
export type DefinitionValues = Values<Definition>;