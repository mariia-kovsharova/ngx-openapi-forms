import SwaggerParser from '@apidevtools/swagger-parser';
import { BaseNode } from 'nodes/baseNode';
import prettier from 'prettier';
import { Entity } from 'types/swagger-types';
import { generateAst } from './ast';
import normalize from './normalize';

const generateHeader = (): string => {
  return `import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';`;
};

export const makeFile = (node: BaseNode): string => {
  const text = `${generateHeader()}\n${node.process()}`;
  return prettier.format(text, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });
};

export default async function main(inputFilePath: string): Promise<string[][]> {
  try {
    const api = await SwaggerParser.dereference(inputFilePath);
    const entities = Object.entries(api?.components?.schemas) as Entity[];
    const normalizedEntities = entities
      .map(([name, values]) => [name, normalize(values)])
      .filter(([, value]) => !!value) as Entity[];
    const nodes = normalizedEntities.map(generateAst);
    const filesData = nodes
      .filter((node: BaseNode) => !node.isInterfaceNode())
      .map((node: BaseNode) => [makeFile(node), node.name]);
    return filesData;
  } catch (e: unknown) {
    console.error(e);
    throw new Error(`Something went wrong: ${e}`);
  }
}
