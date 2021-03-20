[![Build Status](https://travis-ci.org/fiorsaoirse/angular-openapi-forms-gen.svg?branch=master)](https://travis-ci.org/fiorsaoirse/angular-openapi-forms-gen)
<a href="https://codeclimate.com/github/fiorsaoirse/angular-openapi-forms-gen/maintainability"><img src="https://api.codeclimate.com/v1/badges/6d1fc8b0ef0b27065dad/maintainability" /></a>

This is an npm-cli library that allows you to generate Angular Reactive Forms for models from the Open-Api 3.0 description.


### Installation
1. Run `npm i angular-openapi-form-gen --save-dev` in terminal

### Usage
1. In terminal type `angular-openapi-form-gen --input <path-to-openapi> --output <output-dir-path>`. All params are required.
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
            
    
IAquarium:
  type: object
  properties:
    shape:
      type: string
      default: "round"
    background:
      type: string
      default: "transparent"
    
Aquarium:
  type: object
  properties:
    features:
      $ref: "#/components/schemas/IAquarium"
    fishes:
      type: array
      items:
        $ref: "#/components/schemas/Fish" 
```
The lib will generate Reactive forms for **Cat**, **Dog**, **Fish** and **Aquarium** openapi-models.
**PlainProperty** is not a FormGroup, **IPet** and **IAquarium** are interfaces or abstract classes.
Examples of generated multiply files:


In case of the **Aquarium** model, the nested entity "features" is used as one of the properties in the model.
The lib will generate a nested FormGroup:
