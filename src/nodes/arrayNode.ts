import { Entity } from '../types/swagger-types';
import { BaseNode } from './baseNode';

export class ArrayNode extends BaseNode {
  constructor([name, value]: Entity) {
    super(name, 'array');
  }

  public process(): string {
    const name = this.getName();
    const body = '';
    return `${name}: new FormArray([${body}])`;
  }
}
