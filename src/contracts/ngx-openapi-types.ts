export type DefaultValueType = string | number | boolean | null;

export enum DataType {
  Object = 'object',
  Array = 'array',
  String = 'string',
  Boolean = 'boolean',
  Integer = 'integer'
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
  defaultValue?: DefaultValueType;
};

export type PlainDefinition = Definition & {
  type: PrimitiveDataType;
}

export type ObjectDefinition = Definition & {
  type: DataType.Object;
  properties?: Property;
  requiredFields?: Array<string>;
};

export type ArrayDefinition = Definition & {
  type: DataType.Array,
  items?: NonArrayDataType[];
}

export type MergedDefinition = Definition & {
  type: DataType.Object | DataType.String | DataType.Boolean | DataType.Integer,
  allOf: Array<ObjectDefinition | MergedDefinition>
}

export type Schema = PlainDefinition | ObjectDefinition | ArrayDefinition | MergedDefinition;

export type Property = {
  [name: string]: Schema
}

export interface SwaggerEntity {
  name: string;
  value: ObjectDefinition | MergedDefinition;
};