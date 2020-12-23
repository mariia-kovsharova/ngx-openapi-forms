// TODO: fix it
// eslint-disable-next-line import/no-cycle
import generateAst from '../ast';
import { Entity, EntityDescription } from '../types/swagger-types';
import BaseNode from './baseNode';

export default class GroupNode extends BaseNode {
  private children: BaseNode[];

  constructor([name, value]: Entity) {
    super(name, 'group');
    const { properties, required } = value as EntityDescription;
    if (required) {
      required.forEach((propName: string) => {
        if (Object.prototype.hasOwnProperty.call(properties, propName)) {
          properties[propName] = { ...properties[propName], required: true };
        }
      });
    }
    const rawChildren = Object.entries(properties) as Entity[];
    this.children = rawChildren.map(generateAst);
  }

  public process(): string {
    const name = this.getName();
    const body = this.children.map((child: BaseNode) => child.process()).join(',\n');
    return `\nconst ${name} = new FormGroup({
      ${body}
    });\n\n
  export default { ...${name} };`;
  }
}
