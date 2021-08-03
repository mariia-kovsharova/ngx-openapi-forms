
import { DataType, Entity } from '../../../src/contracts/ngx-openapi-types';
import GroupNode from '../../../src/nodes/groupNode';
import ControlNode from '../../../src/nodes/controlNode';

const cat: Entity = {
    name: 'cat',
    value: {
        type: DataType.Object,
        properties: {
            id: {
                type: DataType.String,
                format: 'uuid',
                readOnly: true
            },
            kind: {
                type: DataType.String
            },
            tail: {
                type: DataType.Boolean,
                defaultValue: true
            },
            name: {
                type: DataType.String,
                pattern: '^[a-zA-Z]&'
            }
        },
        requiredFields: ['kind', 'tail', 'name']
    }
}

const id = new ControlNode()

const catNode = new GroupNode(cat)