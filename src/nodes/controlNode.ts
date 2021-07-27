import { SwaggerEntity, SwaggerPlainDefinition, DefaultValueType } from '../contracts/ngx-openapi-types';
import getRule from '../validation/rules';
import BaseNode from './baseNode';

type NonNullValue<T> = T extends null ? never : T;

export default class ControlNode extends BaseNode {

  private readonly disabled: boolean;
  private readonly defaultValue: DefaultValueType;
  private readonly validators?: ReadonlyArray<string>;

  // TODO: ugly
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

  constructor([name, value]: SwaggerEntity) {
    super(name, 'control');

    const properties = value as SwaggerPlainDefinition;
    const rules = Object.entries(properties);
    this.validators = rules.map(getRule).filter(Boolean);
    this.disabled = Object.prototype.hasOwnProperty.call(properties, 'readOnly');
    this.defaultValue = properties.default ?? null;
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
