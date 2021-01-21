import { Entity, EntityDescription } from 'types/swagger-types';
import ArrayNode from './nodes/arrayNode';
import BaseNode from './nodes/baseNode';
import ControlNode from './nodes/controlNode';
import GroupNode from './nodes/groupNode';

type nodeConstructor = (e: Entity, p?: BaseNode) => BaseNode;

const ast = (entity: Entity, parent?: BaseNode): BaseNode => {
  const entityMapper = (type: string): nodeConstructor => (e: Entity, p?: BaseNode): BaseNode => {
    switch (type) {
      case 'object':
        return new GroupNode(e, ast, p);
      case 'array':
        return new ArrayNode(e);
      case 'string':
      case 'boolean':
      case 'integer':
        return new ControlNode(e);
      default:
        throw new Error(`Can not create node for type: ${type}`);
    }
  };

  if (!entity) {
    throw new Error('Entity can not be null');
  }
  const [, value] = entity;
  const { type } = value as EntityDescription;
  return entityMapper(type)(entity, parent);
};

export default ast;
