import { Definition, DefinitionKeys, DefinitionValues } from '../contracts/ngx-openapi-types';
import { isNil } from '../services/utils';

type Property = keyof Definition;

enum BasicValidators {
  Email = 'email',
  Pattern = 'pattern',
  Required = 'required',
  MinLength = 'minLength',
  MaxLength = 'maxLength',
  MinValue = 'min',
  MaxValue = 'max',
}

const buildValidator = (type: BasicValidators, value?: unknown): string =>
  isNil(value) ? `Validators.${type}` : `Validators.${type}(${String(value)})`;

const mapper = [
  {
    check: (name: Property) => name === 'format',
    process: (value: unknown) => (value === 'email' ? 'Validators.email' : null),
  },
  {
    check: (name: Property) => name === 'pattern',
    process: (value: unknown) => buildValidator(BasicValidators.Pattern, `/${value as string}/`),
  },
  {
    check: (name: Property) => name === 'required',
    process: () => buildValidator(BasicValidators.Required),
  },
  {
    check: (name: Property) => name === 'minLength',
    process: (value: unknown) => buildValidator(BasicValidators.MinLength, value),
  },
  {
    check: (name: Property) => name === 'maxLength',
    process: (value: unknown) => buildValidator(BasicValidators.MaxLength, value),
  },
  {
    check: (name: Property) => name === 'minimum',
    process: (value: unknown) => buildValidator(BasicValidators.MinValue, value),
  },
  {
    check: (name: Property) => name === 'maximum',
    process: (value: unknown) => buildValidator(BasicValidators.MaxValue, value),
  },
];

export default <T extends DefinitionValues>(key: DefinitionKeys, value: T): string | null => {
  const rule = mapper.find(({ check }) => check(key));
  if (!rule) {
    return null;
  }
  const { process } = rule;
  return process(value);
};
