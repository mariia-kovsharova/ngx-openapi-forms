import { Entity, NonArrayDefinition, ObjectDefinition } from '../contracts/ngx-openapi-types';
import { NodeConstructor } from '../services/node-builder';
import { isNil } from '../services/utils';
import BaseNode from './baseNode';

export default class GroupNode extends BaseNode {

  private readonly parent?: BaseNode;
  private readonly children: Array<BaseNode>;

  constructor({ name, value }: Entity, childMapper: NodeConstructor, parent?: BaseNode) {
    super(name, 'group');

    const { properties, requiredFields } = value as ObjectDefinition;

    if (requiredFields && properties) {
      const allControlsNames = Object.keys(properties);

      requiredFields.forEach((propName: string) => {
        if (allControlsNames.includes(propName)) {
          properties[propName] = { ...properties[propName], required: true }
        }
      });
    }

    const rawChildren = Object.entries(properties) as Array<[string, NonArrayDefinition]>;

    this.children = rawChildren.map((rawChild: [string, NonArrayDefinition]) => {
      const [name, value] = rawChild;
      return childMapper({ name, value }, this);
    });

    this.parent = parent;
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
