[![Build Status](https://travis-ci.org/fiorsaoirse/ngx-openapi-forms.svg?branch=master)](https://travis-ci.org/fiorsaoirse/ngx-openapi-forms)
<a href="https://codeclimate.com/github/fiorsaoirse/ngx-openapi-forms/maintainability"><img src="https://api.codeclimate.com/v1/badges/6d1fc8b0ef0b27065dad/maintainability" /></a>

This is an npm-cli library that allows you to generate Angular Reactive Forms for models from the Open-Api 3.0 description.

### Installation
1. Run `npm i ngx-openapi-forms --save-dev` in terminal

### Usage
1. In terminal type `ngx-openapi-forms --input <path-to-openapi-file> --output <output-dir-path>`. All params are required.
2. The lib will parse your open-api file than create one file per top-level model of "object" type in the description.
3. The created `model.ts` file will contain Angular FormGroup with FormControls and FormArrays (exported as default) from the open-api model, including validation and default values.

### Important note
You should import a deep copy of the generated FormGroup object to avoid unexpected behavior.
For expample, use *cloneDeep* method from [lodash](https://lodash.com/docs)

### Example

OpenApi entities:

```
IPet:
  type: object
  properties:
    id:
      type: string
      format: uuid
      readOnly: true
    kind:
      type: string
  required:
    - kind

Cat:
  allOf:
    - $ref: "#/components/schemas/IPet"
    - type: object
      properties:
        tail:
          type: boolean
          default: true
        name:
          type: string
          pattern: "^[a-zA-Z]&"
      required:
        - tail
        - name
    
Dog:
  allOf:
    - $ref: "#/components/schemas/IPet"
    - type: object
      properties:
        tail:
          type: boolean
          default: true
        barks:
          type: boolean
          default: true
        name:
          type: string
          pattern: "^[a-zA-Z]&"
          default: "Bob"
      required:
        - tail
        - name
    
Fish:
  allOf:
    - $ref: "#/components/schemas/IPet"
    - type: object
      properties:
        color:
          type: string
      required:
        - color    
    
IAquariumLook:
  type: object
  properties:
    shape:
      type: string
      default: "round"
    background:
      type: string
      default: "transparent"
          
IAquariumProps:
  type: object
  properties:
    fishes:
      type: array
      items:
        $ref: "#/components/schemas/Fish"
      lights:
        type: number
        minimum: 1
        maximum: 5

Fishes:
  type: array
  items:
    $ref: "#/components/schemas/Fish"
    
Aquarium:
  type: object
  allOf:
    - $ref: "#/components/schemas/IAquariumLook"
    - $ref: "#/components/schemas/IAquariumProps"
    - type: object
      properties:
        foo:
          type: string
          default: "baz"
```
The lib will generate Reactive forms for **Cat**, **Dog**, **Fish** and **Aquarium** openapi-models.
**PlainProperty** is not a FormGroup, **IPet**, **IAquariumLook** and **IAquariumProps** are interfaces or abstract classes.

Examples of generated multiply files:

```
/* tslint:disable */
/* eslint-disable */
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

const cat = new FormGroup({
  id: new FormControl(
    {
      value: null,
      disabled: true,
    },
    []
  ),
  kind: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [Validators.required]
  ),
  tail: new FormControl(
    {
      value: true,
      disabled: false,
    },
    [Validators.required]
  ),
  name: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [Validators.pattern(/^[a-zA-Z]&/), Validators.required]
  ),
});

export default cat;

```

```
/* tslint:disable */
/* eslint-disable */
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

const aquarium = new FormGroup({
  shape: new FormControl(
    {
      value: 'round',
      disabled: false,
    },
    []
  ),
  background: new FormControl(
    {
      value: 'transparent',
      disabled: false,
    },
    []
  ),
  fishes: new FormArray([]),
  lights: new FormControl(
    {
      value: null,
      disabled: false,
    },
    [Validators.min(1), Validators.max(5)]
  ),
  foo: new FormControl(
    {
      value: 'baz',
      disabled: false,
    },
    []
  ),
});

export default aquarium;

```
