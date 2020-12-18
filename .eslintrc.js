module.exports = {
  extends: ['plugin:@typescript-eslint/recommended'],
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    "browser": true,
    "es2021": true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "ecmaVersion": 12,
    "sourceType": "module",
    "project": "./tsconfig.json",
  },
  plugins: [
    "@typescript-eslint"
  ],
};