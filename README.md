[![Build Status](https://travis-ci.org/fiorsaoirse/angular-openapi-forms-gen.svg?branch=master)](https://travis-ci.org/fiorsaoirse/angular-openapi-forms-gen)
<a href="https://codeclimate.com/github/fiorsaoirse/angular-openapi-forms-gen/maintainability"><img src="https://api.codeclimate.com/v1/badges/6d1fc8b0ef0b27065dad/maintainability" /></a>

This is an npm-cli library that allows you to generate Angular Reactive Forms for models from the Open-Api 3.0 description.


### Installation
1. Run `npm i angular-openapi-form-gen --save-dev` in terminal

### Usage
1. In terminal type `angular-openapi-form-gen --input <path-to-openapi> --output <output-dir-path>`. All params are required.
2. The lib will parse your open-api file than create one file per top-level model of "object" type in the description.
3. The created `model.ts` file will contain exported as default Angular FormGroup with FormControls and FormArrays from the open-api model, including validation.

### Important note
You should import a deep copy of the generated FormGroup object to avoid unexpected behavior.
For expample, use *cloneDeep* method from [lodash](https://lodash.com/docs)

### Example

OpenApi entities:

```
PlainProperty:
      type: "string"

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
            
SystemObject:
      allOf:
        - $ref: '#/components/schemas/IBaseEntity'
        - type: 'object'
          properties:
            isFolder:
              type: boolean
DocumentInfo:
      allOf:
        - $ref: '#/components/schemas/SystemObject'
        - type: 'object'
          properties:
            isDeleted:
              type: boolean
              readOnly: true
            content:
              $ref: '#/components/schemas/FileInfo'
FileInfo:
      type: object
      allOf:
        - $ref: '#/components/schemas/IBaseEntity'
        - type: object
          properties:
            mimeType:
              type: string            
```
The lib will generate Reactive forms for **User**, **Group**, **SystemObject**, **FileInfo** and **DocumentInfo** openapi-models. **PlainProperty** is not a FormGroup, **IBaseEntity** is an interface or abstract class for classes.
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
In case of the DocumentInfo model, the nested entity "content" is used as one of the properties in the model.
The lib will generate a nested FormGroup:

**documentInfo.ts**

```
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

const documentInfo = new FormGroup({
  type: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [],
  ),
  isFolder: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [],
  ),
  isDeleted: new FormControl(
    {
      value: null,
      disabled: true,
    },
    [],
  ),
  content: new FormGroup({
    type: new FormControl(
      {
        value: null,
        disabled: false,
      },
      [],
    ),
    mimeType: new FormControl(
      {
        value: null,
        disabled: false,
      },
      [],
    ),
  }),
});

export default documentInfo;
```