import path from 'path';
import { promises as fs } from 'fs';
import prettier from 'prettier';
import buildNode from '../src/services/node-builder';

const FILES = ['cat'];
const FIXTURES = path.join(__dirname, '__fixtures__');
const NORMALIZED_FOLDER = path.join(FIXTURES, 'normalized');
const FORMS_FOLDER = path.join(FIXTURES, 'forms');

describe('build nodes function', () => {
    FILES.forEach((name: string) => {
        const fileName = `${name}.json`;

        it(`build node for file: "${fileName}"`, async () => {
            const textFile = `${name}.txt`;

            const normalizedDataFilePath = path.join(NORMALIZED_FOLDER, fileName);
            const normalizedDataContent = await fs.readFile(normalizedDataFilePath, 'utf-8');
            const resultDataFilePath = path.join(FORMS_FOLDER, textFile);
            const resultDataContent = await fs.readFile(resultDataFilePath, 'utf-8');

            const [normalizedData] = Object.values(JSON.parse(normalizedDataContent));

            const data = buildNode({ name, value: normalizedData } as any);

            const builtData = prettier.format(data.build(), {
                parser: 'typescript',
                trailingComma: 'es5',
                singleQuote: true,
                tabWidth: 2
            });

            expect(builtData === resultDataContent);
        })
    })
});