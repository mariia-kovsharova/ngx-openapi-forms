import { SwaggerEntity } from '../contracts/ngx-openapi-types';
import BaseNode from './baseNode';

export default class ArrayNode extends BaseNode {

  constructor([name, _value]: SwaggerEntity) {
    super(name, 'array');
  }

  public build(): string {
    return `${this.name}: new FormArray([])`;
  }
}
