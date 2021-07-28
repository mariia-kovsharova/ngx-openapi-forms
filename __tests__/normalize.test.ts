import path from 'path';
import { promises as fs } from 'fs';
import normalize from '../src/services/normalize';

const INIT_SUFFIX = 'init';
const NORMALIZED_SUFFIX = 'normalized';
const FILES = ['nested'];
const FIXTURES = path.join(__dirname, '__fixtures__', 'normalize');

describe('Normalize function', () => {
    FILES.forEach((name: string) => {
        const initialFileName = `${name}.${INIT_SUFFIX}.json`;
        const normalizedFileName = `${name}.${NORMALIZED_SUFFIX}.json`;

        it(`Normalized content of ${initialFileName} should be equal ${normalizedFileName}`, async () => {
            const dataToProcessFilePath = path.join(FIXTURES, initialFileName);
            const normalizedDataFilePath = path.join(FIXTURES, normalizedFileName);

            const dataToProcessContent = await fs.readFile(dataToProcessFilePath, 'utf-8');
            const normalizedDataContent = await fs.readFile(normalizedDataFilePath, 'utf-8');

            const [dataToProcess] = Object.values(JSON.parse(dataToProcessContent));
            const [normalizedData] = Object.values(JSON.parse(normalizedDataContent));

            const processedData = normalize(dataToProcess as any);

            expect(processedData).toEqual(normalizedData);
        })
    })
});