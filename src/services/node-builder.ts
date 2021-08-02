import { SwaggerEntity, DataType } from 'contracts/ngx-openapi-types';
import ArrayNode from '../nodes/arrayNode';
import BaseNode from '../nodes/baseNode';
import ControlNode from '../nodes/controlNode';
import GroupNode from '../nodes/groupNode';

type NodeConstructor = (e: SwaggerEntity, p?: BaseNode) => BaseNode;

const entityMapper = (type: DataType): NodeConstructor => (e: SwaggerEntity, p?: BaseNode): BaseNode => {
  switch (type) {
    case DataType.Object:
      return new GroupNode(e, buildNode, p);
    case DataType.Array:
      return new ArrayNode(e);
    case DataType.String:
    case DataType.Boolean:
    case DataType.Integer:
      return new ControlNode(e);
    default:
      throw new Error(`Can not create node for type: ${type}`);
  }
};

const buildNode = (entity: SwaggerEntity, parent?: BaseNode): BaseNode => {
  if (!entity) {
    throw new Error('Entity can not be null');
  }
  const { value: { type } } = entity;
  return entityMapper(type)(entity, parent);
};

export default buildNode;
