import path from 'path';
import { promises as fs } from 'fs';
import normalize from '../src/services/normalize';

const ENTITIES = ['nested', 'cat', 'dog', 'aquarium'];
const FIXTURES = path.join(__dirname, '__fixtures__');
const INITIAL_FOLDER = path.join(FIXTURES, 'initial');
const NORMALIZED_FOLDER = path.join(FIXTURES, 'normalized');

describe('Normalize function', () => {
    ENTITIES.forEach((entity: string) => {
        const fileName = `${entity}.json`;

        it(`Normalization of file: "${fileName}"`, async () => {
            const dataToProcessFilePath = path.join(INITIAL_FOLDER, fileName);
            const normalizedDataFilePath = path.join(NORMALIZED_FOLDER, fileName);

            const dataToProcessContent = await fs.readFile(dataToProcessFilePath, 'utf-8');
            const normalizedDataContent = await fs.readFile(normalizedDataFilePath, 'utf-8');

            const [dataToProcess] = Object.values(JSON.parse(dataToProcessContent));
            const [normalizedData] = Object.values(JSON.parse(normalizedDataContent));

            const processedData = normalize(dataToProcess as any);

            expect(processedData).toEqual(normalizedData);
        })
    })
});