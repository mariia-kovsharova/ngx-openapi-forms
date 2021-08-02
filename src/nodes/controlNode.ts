import { Entity, DefaultValueType, ObjectDefinition } from '../contracts/ngx-openapi-types';
import { isNil, isString } from '../services/utils';
import getRule from '../validation/rules';
import BaseNode from './baseNode';

type NonNullValue<T> = T extends null ? never : T;

export default class ControlNode extends BaseNode {

  private readonly disabled: boolean;
  private readonly defaultValue: DefaultValueType;
  private readonly validators?: ReadonlyArray<string>;

  private static transformDefaultValue<T>(value: T | null): NonNullValue<T> {
    if (value === null) {
      return 'null';
    }

    if (isString(value)) {
      return `"${value}"`;
    }

    return value;
  }

  constructor({ name, value }: Entity) {
    super(name, 'control');

    const { properties } = value as ObjectDefinition;

    const names = Object.keys(properties);



    this.validators = rules.map(getRule).filter(Boolean);

    this.disabled = Object.prototype.hasOwnProperty.call(properties, 'readOnly');

    // this.defaultValue = properties.default ?? null;
  }

  public build(): string {
    const { defaultValue } = this;

    const transformedValue = ControlNode.transformDefaultValue(defaultValue);

    return `${this.name}: new FormControl({
      value: ${transformedValue.toString()},
      disabled: ${this.disabled.toString()},
    }, [${this.validators?.join(',') ?? ''}])`;
  }
}
