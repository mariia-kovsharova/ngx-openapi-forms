import { Entity, NonArrayDefinition, ObjectDefinition, Schema } from '../contracts/ngx-openapi-types';
import { isNil } from '../services/utils';
import BaseNode from './baseNode';

type ChildMapperFn = (e: Entity, parent: BaseNode) => BaseNode;

export default class GroupNode extends BaseNode {

  private readonly parent?: BaseNode;
  private readonly children?: Array<BaseNode>;

  constructor({ name, value }: Entity, childMapper: ChildMapperFn, parent?: BaseNode) {
    super(name, 'group');

    const { properties, requiredFields } = value as ObjectDefinition;

    if (requiredFields && properties) {
      requiredFields.forEach((propName: string) => {
        if (Object.prototype.hasOwnProperty.call(properties, propName)) {
          properties[propName] = { ...properties[propName], required: true };
        }
      });
    }

    this.parent = parent;

    const rawChildren = Object.entries(properties ?? {});
    this.children = rawChildren.map((rawChild: [string, NonArrayDefinition]) => {
      const [name, value] = rawChild;
      const entity: Entity = { name, value }
    });
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

  public build(): string {
    const { name } = this;
    const body = this.children.map((child: BaseNode) => child.build()).join(',\n');
    const isInnerNode = !isNil(this.parent);

    return isInnerNode ? GroupNode.buildInnerNode(name, body) : GroupNode.buildUpperNode(name, body);
  }
}
