#!/usr/bin/env node

import commander from 'commander';
import generateForms from '../main';
import { promises as fs } from 'fs';
import camelcase from 'camelcase';
import path from 'path';

commander
  .description('Generates Angular Reactive Forms from open-api yaml/json file to output dir')
  .version('0.0.1')
  .arguments('<inputFilePath> <outputDir>')
  .action(async (inputFilePath: string, outputDir: string) => {
    try {
      const files = await generateForms(inputFilePath);
      await fs.mkdir(outputDir, { recursive: true });
      for (let [file, fileName] of files) {
        const name = `${camelcase(fileName)}.ts`;
        const fullPath = path.join(outputDir, name);
        await fs.writeFile(fullPath, file, { encoding: 'utf-8' });
      }
      console.log(`Generating files successfully completed. Files created at ${outputDir}`);
    } catch (e: unknown) {
      console.error(`Something went wrong: ${e}`);
    }
  })
  .parse(process.argv);
