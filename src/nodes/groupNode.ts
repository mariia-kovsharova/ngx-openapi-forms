import { Entity, EntityDescription } from '../types/swagger-types';
import BaseNode from './baseNode';

type ChildMapperFn = (e: Entity, parent: BaseNode) => BaseNode;

export default class GroupNode extends BaseNode {
  private children: BaseNode[];

  private parent: BaseNode | null;

  constructor([name, value]: Entity, childMapper: ChildMapperFn, parent: BaseNode | null = null) {
    super(name, 'group');
    const { properties, required } = value as EntityDescription;
    if (required && properties) {
      required.forEach((propName: string) => {
        if (Object.prototype.hasOwnProperty.call(properties, propName)) {
          properties[propName] = { ...properties[propName], required: true };
        }
      });
    }
    const rawChildren = Object.entries(properties ?? []) as Entity[];
    this.parent = parent;
    this.children = rawChildren.map((child: Entity) => childMapper(child, this));
  }

  private static buildUpperNode(name: string, body: string): string {
    return `\nconst ${name} = new FormGroup({
      ${body}
    });\n\n
  export default ${name};`;
  }

  private static buildInnerNode(name: string, body: string): string {
    return `${name}: new FormGroup({
        ${body}
      })
    `;
  }

  public process(): string {
    const name = this.getName();
    const body = this.children.map((child: BaseNode) => child.process()).join(',\n');
    const isInnerNode = !!this.parent;
    return isInnerNode ? GroupNode.buildInnerNode(name, body) : GroupNode.buildUpperNode(name, body);
  }
}
