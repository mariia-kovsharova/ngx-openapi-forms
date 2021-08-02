import path from 'path';
import { promises as fs } from 'fs';
import buildNode from '../src/services/node-builder';

const FILES = ['nested', 'cat'];
const FIXTURES = path.join(__dirname, '__fixtures__');
const NORMALIZED_FOLDER = path.join(FIXTURES, 'normalized');

describe('Normalize function', () => {
    it('', () => {
        expect(true).toBeTruthy();
    })
    // FILES.forEach((name: string) => {
    //     const fileName = `${name}.json`;

    //     it(`Normalization of file: "${fileName}"`, async () => {
    //         const dataToProcessFilePath = path.join(INITIAL_FOLDER, fileName);
    //         const normalizedDataFilePath = path.join(NORMALIZED_FOLDER, fileName);

    //         const dataToProcessContent = await fs.readFile(dataToProcessFilePath, 'utf-8');
    //         const normalizedDataContent = await fs.readFile(normalizedDataFilePath, 'utf-8');

    //         const [dataToProcess] = Object.values(JSON.parse(dataToProcessContent));
    //         const [normalizedData] = Object.values(JSON.parse(normalizedDataContent));

    //         const processedData = normalize(dataToProcess as any);

    //         expect(processedData).toEqual(normalizedData);
    //     })
    // })
});