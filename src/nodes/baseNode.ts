import camelcase from 'camelcase';

type nodeTypes = 'control' | 'array' | 'group';

export abstract class BaseNode {
  public name: string;
  public type: nodeTypes;
  constructor(name: string, type: nodeTypes) {
    this.name = name;
    this.type = type;
  }

  public getName(): string {
    return camelcase(this.name);
  }

  public isInterfaceNode(): boolean {
    return this.getName().startsWith('i');
  }

  public abstract process(): string;
}
