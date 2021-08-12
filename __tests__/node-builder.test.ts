import path from 'path';
import { promises as fs } from 'fs';
import prettier from 'prettier';
import buildNode from '../src/services/node-builder';

const ENTITIES = ['cat', 'dog', 'aquarium'];
const FIXTURES = path.join(__dirname, '__fixtures__');
const NORMALIZED_FOLDER = path.join(FIXTURES, 'normalized');
const FORMS_FOLDER = path.join(FIXTURES, 'forms');

describe('build nodes function', () => {
    ENTITIES.forEach((entity: string) => {
        const fileName = `${entity}.json`;

        it(`build node for file: "${fileName}"`, async () => {
            const resultTextFile = `${entity}.txt`;

            const normalizedDataFilePath = path.join(NORMALIZED_FOLDER, fileName);
            const normalizedDataContent = await fs.readFile(normalizedDataFilePath, 'utf-8');
            const resultDataFilePath = path.join(FORMS_FOLDER, resultTextFile);
            const resultDataContent = await fs.readFile(resultDataFilePath, 'utf-8');

            const [normalizedData] = Object.values(JSON.parse(normalizedDataContent));

            const node = buildNode({ name: entity, value: normalizedData } as any);

            const builtData = prettier.format(node.build(), {
                parser: 'typescript',
                trailingComma: 'es5',
                singleQuote: true,
                tabWidth: 2,
                useTabs: false
            });

            expect(builtData).toBe(resultDataContent);
        })
    })
});