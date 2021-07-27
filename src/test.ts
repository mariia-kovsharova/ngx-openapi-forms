import { promises as fs } from 'fs';
import path from 'path';
import { OpenAPI, OpenAPIV3 } from 'openapi-types';
import SwaggerParser from '@apidevtools/swagger-parser';

const isOpenApiV3Document = (api: OpenAPI.Document): api is OpenAPIV3.Document => {
    return !!(api as OpenAPIV3.Document).openapi;
};

const main = async (inputFilePath: string) => {
    try {


        const api = await SwaggerParser.dereference(inputFilePath);

        if (!isOpenApiV3Document(api)) {
            throw new Error('Current version of library supports only OpenApi versions 3.0 and above.');
        }

        const { components } = api;

        console.log(JSON.stringify(components, null, 2));

    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Something went wrong: %s', error);
    }
};

const f = path.join(__dirname, 'api.yml');

main(f);

export { };
