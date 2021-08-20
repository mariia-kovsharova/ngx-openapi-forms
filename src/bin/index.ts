#!/usr/bin/env node
import { program } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import generate from '../main';
import { OpenAPI, OpenAPIV3 } from 'openapi-types';
import SwaggerParser from '@apidevtools/swagger-parser';
import { IGeneratedFile } from '../contracts/ngx-openapi-gen';

const isOpenApiV3Document = (api: OpenAPI.Document): api is OpenAPIV3.Document => {
  return !!(api as OpenAPIV3.Document).openapi;
};

program
  .description('Generates Angular Reactive Forms templates from openapi yaml/json file to output dir')
  .version('1.0.0')
  .option('-i, --input', 'Path to openapi file')
  .option('-o, --output', 'Path to dir for output files')
  .arguments('<input> <output>')
  .action(async (inputFilePath: string, outputFilePath: string) => {
    try {
      const writeFile = async ({ name, content }: IGeneratedFile): Promise<void> => {
        const fullName = `${name}.ts`;
        const fullPath = path.join(outputFilePath, fullName);
        await fs.writeFile(fullPath, content, { encoding: 'utf-8' });
      };

      const options: SwaggerParser.Options = {
        dereference: {
          circular: true,
        },
        validate: {
          schema: true
        }
      };

      const api = await SwaggerParser.validate(inputFilePath, options);

      if (!isOpenApiV3Document(api)) {
        throw new Error('Current version of library supports only OpenApi versions 3.0 and above.');
      }

      const generatedFileContents = generate(api);

      await fs.mkdir(outputFilePath, { recursive: true });
      await Promise.all(generatedFileContents.map(writeFile));

      // eslint-disable-next-line no-console
      console.log(`Generating files successfully completed. Files created at path: ${outputFilePath} (click link to open)`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong: %s', error);
    }
  })
  .parse(process.argv);
