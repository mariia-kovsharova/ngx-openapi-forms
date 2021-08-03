import { OpenAPIV3 } from 'openapi-types';
import BaseNode from 'nodes/baseNode';
import prettier from 'prettier';
import normalize from './services/normalize';
import { IGeneratedFile } from './contracts/ngx-openapi-gen';
import { hasPresentKey } from './services/utils';
import adapt from '../src/services/types-adapter';
import buildNode from '../src/services/node-builder';

const buildImports = (): string => {
  return `
  /* tslint:disable */
  /* eslint-disable */
  import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';`;
};

const buildFileContent = (node: BaseNode): string => {
  const imports = buildImports();
  const body = node.build();
  const text = `${imports}\n${body}`;

  return prettier.format(text, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });
};

export default function main(api: OpenAPIV3.Document): ReadonlyArray<IGeneratedFile> {
  const { components } = api;
  const schemas = components?.schemas ?? {};
  const entities = Object.entries(schemas)
    .map(([name, value]) => {
      return {
        name,
        value: value as OpenAPIV3.SchemaObject
      };
    });

  return entities
    .map(({ name, value }) => ({ name, value: adapt(value) }))
    .map(({ name, value }) => ({ name, value: normalize(value) }))
    .filter(hasPresentKey('value'))
    .map(entity => buildNode(entity))
    .filter(node => node.isFormGroup() && !node.isInterfaceNode())
    .map(node => ({
      name: node.name,
      content: buildFileContent(node)
    }));
}
