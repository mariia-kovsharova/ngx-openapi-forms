import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPI, OpenAPIV3 } from 'openapi-types';
import BaseNode from 'nodes/baseNode';
import prettier from 'prettier';
import { Entity } from 'types/swagger-types';
import generateAst from './ast';
import normalize from './normalize';
import { GeneratorMode } from 'contracts';
import GroupNode from 'nodes/groupNode';

const generateReactiveHeader = (): string => {
  return `
  /* tslint:disable */
  /* eslint-disable */
  import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';`;
};

export const generateHtml = (node: BaseNode): string => {
  const text = '';
  return prettier.format(text, {
    parser: 'html'
  });
};

export const generateReactive = (node: BaseNode): string => {
  const text = `${generateReactiveHeader()}\n${node.process()}`;
  return prettier.format(text, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });
};

const isOpenApiV3Document = (api: OpenAPI.Document): api is OpenAPI.Document => {
  return !!(api as OpenAPIV3.Document).openapi;
};

const isGroupNode = (node: BaseNode): boolean => node.type === 'group';

const getGenerator = (mode: GeneratorMode): { generate: (n: BaseNode) => string } => {
  switch (mode) {
    case 'reactive':
      return { generate: generateReactive };
    case 'html':
      return { generate: generateHtml };
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

export default async function main(inputFilePath: string, mode: GeneratorMode): Promise<string[][]> {
  const api: OpenAPI.Document = await SwaggerParser.dereference(inputFilePath);
  if (!isOpenApiV3Document(api)) {
    throw new Error('Current version of library supports only OpenApi versions 3.0 and above.');
  }
  const { components } = api as OpenAPIV3.Document;
  const schemas = components?.schemas ?? {};
  const entities = Object.entries(schemas) as Entity[];
  const normalizedEntities = entities
    .map(([name, values]) => [name, normalize(values)])
    .filter(([, value]) => !!value) as Entity[];
  const nodes = normalizedEntities.map((entity: Entity) => generateAst(entity));
  const generator: (node: BaseNode) => string = getGenerator(mode);
  return nodes
    .filter(isGroupNode)
    .filter((node: BaseNode) => !node.isInterfaceNode())
    .map((node: BaseNode) => [node.name, generator.generate(node)]);
}
