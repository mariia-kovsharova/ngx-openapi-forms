import { generateAst } from '../ast';
import { Entity, EntityDescription } from '../types/swagger-types';
import { BaseNode } from './baseNode';

export class GroupNode extends BaseNode {
  private children: BaseNode[];

  constructor([name, value]: Entity) {
    super(name, 'group');
    const { properties, required } = value as EntityDescription;
    required?.forEach((propName: string) => {
      if (properties.hasOwnProperty(propName)) {
        properties[propName] = { ...properties[propName], required: true };
      }
    });
    const rawChildren = Object.entries(properties) as Entity[];
    this.children = rawChildren.map((entity: Entity) => generateAst(entity));
  }

  public process(): string {
    const name = this.getName();
    const body = this.children.map((child: BaseNode) => child.process()).join(',\n');
    return `\nconst ${name} = new FormGroup({
      ${body}
    });\n\n
  export default ${name};`;
  }
}
