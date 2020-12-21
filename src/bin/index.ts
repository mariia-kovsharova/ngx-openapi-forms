#!/usr/bin/env node

import commander from 'commander';
import { promises as fs } from 'fs';
import camelcase from 'camelcase';
import path from 'path';
import generateForms from '../main';

commander
  .description('Generates Angular Reactive Forms from openapi yaml/json file to output dir')
  .version('0.0.3')
  .option('-i, --input', 'Input path to openapi file')
  .option('-o, --output', 'Output path to dir where generated forms will be created')
  .arguments('<input> <output>')
  .action(async (input: string, output: string) => {
    try {
      const writeFile = async (file: string, fileName: string): Promise<void> => {
        const name = `${camelcase(fileName)}.ts`;
        const fullPath = path.join(output, name);
        await fs.writeFile(fullPath, file, { encoding: 'utf-8' });
      };
      const files = await generateForms(input);
      await fs.mkdir(output, { recursive: true });
      const promises = files.map(([file, fileName]) => writeFile(file, fileName));
      await Promise.all(promises);
      // eslint-disable-next-line no-console
      console.log(`Generating files successfully completed. Files created at ${output}`);
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong: %s', e);
    }
  })
  .parse(process.argv);
