import { Entity, DefaultValueType, ObjectDefinition, Definition, PlainDefinition } from '../contracts/ngx-openapi-types';
import { isString } from '../services/utils';
import getRule from '../validation/rules';
import BaseNode from './baseNode';

export default class ControlNode extends BaseNode {

  private readonly disabled: boolean;
  // private readonly defaultValue: DefaultValueType;
  private readonly validators?: ReadonlyArray<string>;

  private static transformDefaultValue<T>(value: T | null): NonNullable<T> | string {
    if (value === null) {
      return 'null';
    }

    if (isString(value)) {
      return `"${value}"`;
    }

    // TODO: fix
    return value as any;
  }

  constructor({ name, value }: Entity) {
    super(name, 'control');

    const { properties } = value as ObjectDefinition;
    const names = Object.keys(properties);

    this.validators = names
      .map(name => {
        const definition = properties[name];
        const definitionKeys = Object.keys(definition) as Array<keyof Definition>;
        return definition && getRule(name, definition);
      })
      .filter((v: string | undefined): v is string => isString(v));

    this.disabled = names.includes('readOnly');

    const defaultValue = properties['defaultValue'] ?? null;
    // this.defaultValue = defaultValue as PlainDefinition;
  }

  public build(): string {
    // const { defaultValue } = this;

    // TODO: fix
    const transformedValue = ControlNode.transformDefaultValue(null);

    return `${this.name}: new FormControl({
      value: ${transformedValue.toString()},
      disabled: ${this.disabled.toString()},
    }, [${this.validators?.join(',') ?? ''}])`;
  }
}
