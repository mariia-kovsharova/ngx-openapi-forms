import { Entity, ObjectEntity, Schema } from '../contracts/ngx-openapi-types';
import { NodeConstructor } from '../services/node-builder';
import { isNil } from '../services/utils';
import BaseNode from './baseNode';

export default class GroupNode extends BaseNode {

  private readonly parent?: BaseNode;
  private readonly children: Array<BaseNode>;

  constructor({ name, value }: ObjectEntity, childMapper: NodeConstructor, parent?: BaseNode) {
    super(name, 'group');

    const { properties, requiredFields } = value;

    if (requiredFields && properties) {
      const allControlsNames = Object.keys(properties);

      requiredFields.forEach((propName: string) => {
        if (allControlsNames.includes(propName)) {
          properties[propName] = { ...properties[propName], required: true }
        }
      });
    }

    const rawChildren = Object.entries<Schema>(properties);

    this.children = rawChildren.map((rawChild: [string, Schema]) => {
      const [name, value] = rawChild;
      const entity: Entity = { name, value };

      return childMapper(entity, this);
    });

    this.parent = parent;
  }

  private static buildUpperNode(name: string, body: string): string {
    return `const ${name} = new FormGroup({
      ${body}}
    );
    
    export default ${name};`;
  }

  private static buildInnerNode(name: string, body: string): string {
    return `${name}: new FormGroup({
      ${body}
    })`;
  }

  public build(): string {
    const { name } = this;
    const body = this.children.map((child: BaseNode) => child.build()).join(',');
    const isInnerNode = !isNil(this.parent);

    return isInnerNode ? GroupNode.buildInnerNode(name, body) : GroupNode.buildUpperNode(name, body);
  }
}
