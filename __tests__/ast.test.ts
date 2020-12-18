import path from 'path';
import generateFiles from '../src/main';
import { promises as fs } from 'fs';
import camelcase from 'camelcase';

describe('Test creating Reactive Angular Form files from open-api descriptions', () => {
  const fixturesPath = path.join(__dirname, '__fixtures__');
  const formsFilesDirPath = path.join(fixturesPath, 'forms');
  const apiJsonFile = path.join(fixturesPath, 'api.json');
  const apiYmlFile = path.join(fixturesPath, 'api.yml');
  let formsMap = new Map<string, string>();

  const readFileContent = async (fileName: string): Promise<string> => {
    const filePath = path.join(formsFilesDirPath, fileName);
    return await fs.readFile(filePath, {
      encoding: 'utf-8',
    });
  };

  beforeAll(async (done) => {
    const resultFiles = await fs.readdir(formsFilesDirPath);
    for (let fileName of resultFiles) {
      const { name, base } = path.parse(fileName);
      const fileContent = await readFileContent(base);
      formsMap.set(name, fileContent);
    }
    done();
  });

  it('should generate forms from .json open-api file', async () => {
    const models = await generateFiles(apiJsonFile);
    models.forEach(([file, fileName]) => {
      const expectedData = formsMap.get(camelcase(fileName));
      expect(file).toBe(expectedData);
    });
  });

  it('should generate forms from .yml open-api file', async () => {
    const models = await generateFiles(apiYmlFile);
    models.forEach(([file, fileName]) => {
      const expectedData = formsMap.get(camelcase(fileName));
      expect(file).toBe(expectedData);
    });
  });
});

export {
  // https://github.com/Microsoft/TypeScript/issues/15230
};
