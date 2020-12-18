const ruleMapper = [
  {
    check: (name: string) => name === 'format',
    process: (value: unknown) => (value === 'email' ? 'Validators.email' : ''),
  },
  {
    check: (name: string) => name === 'pattern',
    process: (value: unknown) => `Validators.pattern(${value})`,
  },
  {
    check: (name: string) => name === 'required',
    process: (_value: unknown) => 'Validators.required',
  },
  {
    check: (name: string) => name === 'minLength',
    process: (value: unknown) => `Validators.minLength(${value})`,
  },
  {
    check: (name: string) => name === 'maxLength',
    process: (value: unknown) => `Validators.maxLength(${value})`,
  },
  {
    check: (name: string) => name === 'minimum',
    process: (value: unknown) => `Validators.min(${value})`,
  },
  {
    check: (name: string) => name === 'maximum',
    process: (value: unknown) => `Validators.max(${value})`,
  },
];

export default ([key, value]: [string, unknown]): string => {
  const ruleProcess = ruleMapper.find(({ check }) => check(key));
  if (!ruleProcess) {
    return '';
  }
  const { process } = ruleProcess;
  return process(value);
};
