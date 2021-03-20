#!/usr/bin/env node
import { GeneratorMode } from 'contracts';
import commander from 'commander';
import { promises as fs } from 'fs';
import camelcase from 'camelcase';
import path from 'path';
import generate from '../main';

commander
  .description('Generates Angular Reactive Forms or HTML parts from openapi yaml/json file to output dir')
  .version('1.0.0')
  .option('-i, --input', 'Path to openapi file')
  .option('-o, --output', 'Path to dir for output files')
  .option('-m, --mode [type]', `Change mode to generate templates. Default value is "reactive".
                                Possible values:
                                  - "reactive" - generates .ts files with FormGroup
                                  - "html" - generate .html file as partial templates for copy-paste into your template`)
  .arguments('<input> <output>')
  .action(async (input: string, output: string, mode: GeneratorMode = 'reactive') => {
    try {
      const writeFile = async (fileName: string, file: string): Promise<void> => {
        const name = `${camelcase(fileName)}.ts`;
        const fullPath = path.join(output, name);
        await fs.writeFile(fullPath, file, { encoding: 'utf-8' });
      };
      const files = await generate(input, mode);
      await fs.mkdir(output, { recursive: true });
      const promises = files.map(([fileName, file]) => writeFile(file, fileName));
      await Promise.all(promises);
      // eslint-disable-next-line no-console
      console.log(`Generating files successfully completed. Files created at path: ${output} (click to open)`);
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong: %s', e);
    }
  })
  .parse(process.argv);
