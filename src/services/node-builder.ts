import {
  Entity,
  DataType,
  ArrayEntity,
  ObjectEntity,
  PlainEntity,
  NodeConstructor,
} from '../contracts/ngx-openapi-types';
import ArrayNode from '../nodes/arrayNode';
import BaseNode from '../nodes/baseNode';
import ControlNode from '../nodes/controlNode';
import GroupNode from '../nodes/groupNode';
import { isNil } from './utils';

const entityMapper =
  (type: DataType): NodeConstructor =>
  (e: Entity, p?: BaseNode): BaseNode => {
    switch (type) {
      case DataType.Object:
        return new GroupNode(e as ObjectEntity, buildNode, p);
      case DataType.Array:
        return new ArrayNode(e as ArrayEntity);
      case DataType.String:
      case DataType.Boolean:
      case DataType.Number:
      case DataType.Integer:
        return new ControlNode(e as PlainEntity);
      default:
        throw new Error(`Can not create node for type: ${String(type)}`);
    }
  };

const buildNode = (entity: Entity, parent?: BaseNode): BaseNode => {
  if (isNil(entity)) {
    throw new Error('Entity can not be null');
  }
  const {
    value: { type },
  } = entity;
  return entityMapper(type)(entity, parent);
};

export default buildNode;
