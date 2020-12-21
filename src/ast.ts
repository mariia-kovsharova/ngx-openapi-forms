import { Entity, EntityDescription } from 'types/swagger-types';
import ArrayNode from './nodes/arrayNode';
import BaseNode from './nodes/baseNode';
import ControlNode from './nodes/controlNode';
// TODO: fix it
// eslint-disable-next-line import/no-cycle
import GroupNode from './nodes/groupNode';

type nodeConstructor = (e: Entity) => BaseNode;

const entityMapper = (type: string): nodeConstructor => (entity: Entity): BaseNode => {
  switch (type) {
    case 'object':
      return new GroupNode(entity);
    case 'array':
      return new ArrayNode(entity);
    case 'string':
    case 'boolean':
    case 'integer':
      return new ControlNode(entity);
    default:
      throw new Error(`Can not create node for type: ${type}`);
  }
};

export default (entity: Entity): BaseNode => {
  if (!entity) {
    throw new Error('Entity can not be null');
  }
  const [, value] = entity;
  const { type } = value as EntityDescription;
  return entityMapper(type)(entity);
};
