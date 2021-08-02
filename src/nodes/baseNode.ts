import camelcase from 'camelcase';

type FormNodeType = 'control' | 'array' | 'group';

export default abstract class BaseNode {

  private readonly _name: string;
  private readonly _type: FormNodeType;

  constructor(name: string, type: FormNodeType) {
    this._name = camelcase(name);
    this._type = type;
  }

  protected get type(): FormNodeType {
    return this._type;
  }

  public get name(): string {
    return this._name;
  }

  public isFormGroup(): boolean {
    return this._type === 'group';
  }

  public isInterfaceNode(): boolean {
    return this.name.startsWith('i');
  }

  public abstract build(): string;
}
