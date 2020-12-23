[![Build Status](https://travis-ci.org/fiorsaoirse/angular-openapi-forms-gen.svg?branch=master)](https://travis-ci.org/fiorsaoirse/angular-openapi-forms-gen)
<a href="https://codeclimate.com/github/fiorsaoirse/angular-openapi-forms-gen/maintainability"><img src="https://api.codeclimate.com/v1/badges/6d1fc8b0ef0b27065dad/maintainability" /></a>

This is npm-cli library that allows you to generate Angular Reactive Forms for models from Open-Api 3.0 description.


### Installation
1. Run `npm i angular-openapi-form-gen --save-dev` in terminal

### Usage
1. In terminal type `angular-openapi-form-gen --input <path-to-openapi> --output <output-dir-path>`. All params are required.
2. The lib will parse your open-api file than creates one file per model in description. The created `model.ts` file will contain Angular exported as default FormGroup with FormControls and FormArrays from open-api model, including validation from open-api.

### Important note
You should import deep copy of generated FormGroup object to avoid unexpected behavior.
For expample, use *cloneDeep* method from [lodash](https://lodash.com/docs)

### Example

OpenApi entities:

```
IBaseEntity:
      type: "object"
      properties:
        objectId:
          type: "string"
          readOnly: true

User:
      allOf:
        - $ref: "#/components/schemas/IBaseEntity"
        - type: "object"
          properties:
            login:
              type: "string"
              pattern: "^[a-zA-Z]&"
            address:
              type: "string"
              format: "email"
            description:
              type: "string"
            roles:
              type: "array"
              items:
                $ref: "#/components/schemas/Roles"
            active:
              type: "boolean"
              default: false
          required:
            - login
            - address
            - active
          xml:
            name: "User"

Group:
      allOf:
        - $ref: "#/components/schemas/IBaseEntity"
        - type: "object"
          properties:
            name:
              type: "string"
              pattern: "^[a-zA-Z0-9]&"
              minLength: 5
              maxLength: 20
            description:
              type: "string"
          xml:
            name: "Group"
```

Generated multiply files:

**user.ts**

```
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

const user = new FormGroup({
  objectId: new FormControl(
    {
      value: null,
      disabled: true,
    },
    [],
  ),
  login: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [Validators.pattern(/^[a-zA-Z]&/), Validators.required],
  ),
  address: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [Validators.email, Validators.required],
  ),
  description: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [],
  ),
  roles: new FormArray([]),
  active: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [Validators.required],
  ),
});

export default user;

```

**group.ts**

```
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

const group = new FormGroup({
  objectId: new FormControl(
    {
      value: null,
      disabled: true,
    },
    [],
  ),
  name: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [
      Validators.pattern(/^[a-zA-Z0-9]&/),
      Validators.minLength(5),
      Validators.maxLength(20),
    ],
  ),
  description: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [],
  ),
});

export default group;
```
