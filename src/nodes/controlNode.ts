import { Entity, EntityProperty, DefaultProperty } from '../types/swagger-types';
import getRule from '../validation/rules';
import BaseNode from './baseNode';

type NonNullValue<T> = T extends null ? never : T;

export default class ControlNode extends BaseNode {
  public validationRules?: string[];

  public disabled = false;

  public defaultValue: DefaultProperty;

  private static transformDefaultValue<T>(value: T): NonNullValue<T>;

  private static transformDefaultValue<T>(value: T): string | T {
    if (value === null) {
      return 'null';
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    return value;
  }

  constructor([name, value]: Entity) {
    super(name, 'control');
    const properties = value as EntityProperty;
    const rules = Object.entries(properties);
    this.validationRules = rules.map(getRule).filter(Boolean);
    this.disabled = Object.prototype.hasOwnProperty.call(properties, 'readOnly');
    this.defaultValue = properties.default ?? null;
  }

  public getValidationRules(): string {
    return this.validationRules?.join(', ') ?? '';
  }

  public process(): string {
    const { defaultValue } = this;
    const transformedValue = ControlNode.transformDefaultValue(defaultValue);
    return `${this.name}: new FormControl({
      value: ${transformedValue.toString()},
      disabled: ${this.disabled.toString()},
    }, [${this.getValidationRules()}])`;
  }
}
