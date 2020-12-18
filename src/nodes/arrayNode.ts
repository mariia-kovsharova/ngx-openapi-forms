import { Entity } from '../types/swagger-types';
import { BaseNode } from './baseNode';

export class ArrayNode extends BaseNode {
  constructor([name, _value]: Entity) {
    super(name, 'array');
  }

  public process(): string {
    const name = this.getName();
    return `${name}: new FormArray([])`;
  }
}
