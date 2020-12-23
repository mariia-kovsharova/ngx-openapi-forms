import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPI, OpenAPIV3 } from 'openapi-types';
import BaseNode from 'nodes/baseNode';
import prettier from 'prettier';
import { Entity } from 'types/swagger-types';
import generateAst from './ast';
import normalize from './normalize';

const generateHeader = (): string => {
  return `
  /* tslint:disable */
  /* eslint-disable */
  import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';`;
};

export const makeFile = (node: BaseNode): string => {
  const text = `${generateHeader()}\n${node.process()}`;
  return prettier.format(text, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });
};

const isOpenApiV3Document = (api: OpenAPI.Document): api is OpenAPI.Document => {
  return !!(api as OpenAPIV3.Document).openapi;
};

export default async function main(inputFilePath: string): Promise<string[][]> {
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
  const nodes = normalizedEntities.map(generateAst);
  return nodes.filter((node: BaseNode) => !node.isInterfaceNode()).map((node: BaseNode) => [makeFile(node), node.name]);
}
