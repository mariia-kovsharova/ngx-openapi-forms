import { Entity, EntityDescription, EntityProperty } from '../types/swagger-types';
import getRule from '../validation/rules';
import { BaseNode } from './baseNode';

export class ControlNode extends BaseNode {
  public validationRules?: string[];
  public disabled: boolean = false;

  constructor([name, value]: Entity) {
    super(name, 'control');
    const props = value as EntityProperty;
    const rules = Object.entries(props);
    this.validationRules = rules.map(getRule).filter(Boolean);
    this.disabled = props.hasOwnProperty('readOnly');
  }

  public getValidationRules(): string {
    return this.validationRules?.join(', ') ?? '';
  }

  public process(): string {
    return `${this.name}: new FormControl({
      value: null,
      disabled: ${this.disabled},
    }, [${this.getValidationRules()}])`;
  }
}
