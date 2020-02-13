// skill-api.test.js

/* eslint-env jest */

'use strict';

const skill = require('../skill-api');
const outputSchema = require('../skill-config')['outputSchema'];

const Ajv = require('ajv');

const ajv = new Ajv();

const context = {
    logger: {
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
};

const assertValidOutput = (result, configuration) => {
    // Test result is a valid JSON according to outputSchema(config)
    ajv.validate(outputSchema(configuration), result);
    expect(ajv.errors).toBe(null);
};

describe('SKILL RUNTIME - Basic Tests', () => {

    test('Checking a skill called without input is throwing', async () => {
        const config = {};
        try {
            await skill(config)(undefined, context);
        }
        catch (error) {
            expect(error.message).toBe('Skill is called without input.');
        }
    });

    test('Checking a correct input logs in context', async () => {
        const config = {
            'useCountry': 'false'
        };
        const input = {
            name: 'Jane'
        };
        const result = await skill(config)(input, context);
        expect(context.logger.info).toHaveBeenCalledTimes(2);
        assertValidOutput(result, config);
    });

    test('Checking a correct input with a country ID provided at config time', async () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
            'countryId': 'US'
        };
        const input = {
            name: 'Jane'
        };
        const result = await skill(config)(input, context);
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('age');
        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('countryId');
        expect(result.countryId).toBe(config.countryId);
    });

    test('Checking a correct input with a country ID provided at runtime', async () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide'
        };
        const input = {
            name: 'Jane',
            countryId: 'US'
        };
        const result = await skill(config)(input, context);
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('age');
        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('countryId');
        expect(result.countryId).toBe(input.countryId);
    });

    test('Checking a correct input with a timeout', async () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
            'countryId': 'US'
        };
        const input = {
            name: 'Jane',
            timeout: 10000
        };
        const result = await skill(config)(input, context);
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('age');
        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('countryId');
        expect(result.countryId).toBe(config.countryId);
    });

    test('Checking a correct input without a country ID', async () => {
        const config = {
            'useCountry': 'false'
        };
        const input = {
            name: 'Jane'
        };
        const result = await skill(config)(input, context);
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('age');
        expect(result).toHaveProperty('count');
        expect(result).not.toHaveProperty('countryId');
    });

    test('Checking an invalid input (with the country ID already defined in the configuration) is throwing', async () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
            'countryId': 'US'
        };
        const input = {
            name: 'Jane',
            'countryId': 'FR'
        };
        try {
            await skill(config)(input, context);
        }
        catch (error) {
            expect(error.message).toBe('The country ID is already defined in the configuration and cannot be overridden at runtime.');
        }
    });

    test('Checking an invalid input (with the country ID missing in the configuration) is throwing', async () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
        };
        const input = {
            name: 'Jane',
            'countryId': 'FR'
        };
        try {
            await skill(config)(input, context);
        }
        catch (error) {
            expect(error.message).toBe('The country ID is missing in the configuration. You must set the country ID in the configuration or specify that you want to provide it at runtime.');
        }
    });

    test('Checking an invalid input (with a country ID that is not provided at runtime) is throwing', async () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide'
        };
        const input = {
            name: 'Jane'
        };
        try {
            await skill(config)(input, context);
        }
        catch (error) {
            expect(error.message).toBe('The country ID is undefined. You must set the country ID in the configuration or provide it in the `countryId` property in the input at runtime.');
        }
    });

    test('Checking an invalid input (without country retrieval method) is throwing', async () => {
        const config = {
            'useCountry': 'true'
        };
        const input = {
            name: 'Jane',
            countryId: 'US'
        };
        try {
            await skill(config)(input, context);
        }
        catch (error) {
            expect(error.message).toBe('The country retrieval method is undefined. You must set the country retrieval method in the configuration.');
        }
    });

    test('Checking an invalid input (with an incorrect country ID) is throwing', async () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide'
        };
        const input = {
            name: 'Jane',
            countryId: 'UK'
        };
        try {
            await skill(config)(input, context);
        }
        catch (error) {
            expect(error.message).toBe('The UK country ID is not valid. Only ISO 3166-1 alpha-2 codes are supported.');
        }
    });

    test('Checking an invalid input (without a first name) is throwing', async () => {
        const config = {
            'useCountry': 'false'
        };
        const input = {};
        try {
            await skill(config)(input, context);
        }
        catch (error) {
            expect(error.message).toBe('Request failed with status code 422: Missing \'name\' parameter');
        }
    });

    test('Checking an invalid input (without the flag indicating whether to use country) is throwing', async () => {
        const config = {
        };
        const input = {
            name: 'Jane'
        };
        try {
            await skill(config)(input, context);
        }
        catch (error) {
            expect(error.message).toBe('The flag indicating whether to use the country is undefined. You must set the flag indicating whether to use the country in the configuration.');
        }
    });

});

