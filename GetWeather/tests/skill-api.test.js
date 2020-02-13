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

const config = {};

const assertValidOutput = (result, configuration) => {
    // Test result is a valid JSON according to outputSchema(config)
    ajv.validate(outputSchema(configuration), result);
    expect(ajv.errors).toBe(null);
};
/*
describe('SKILL RUNTIME - Basic Tests', () => {

    test('Checking an incorrect input is throwing', () => {
        expect(() => skill(config)(undefined, context)).toThrow('NO_INPUT');
    });

    test('Checking a correct input logs in context', async () => {
        const result = await skill(config)('input', context);
        expect(context.logger.info).toHaveBeenCalledTimes(2);
        assertValidOutput(result, config);
    });

});
*/

describe('SKILL RUNTIME - Api Call Test', () => {

    // test('Checking an incorrect input is throwing', () => {
    //     expect(() => skill(config)(undefined, context)).toThrow('NO_INPUT');
    // });

    // test('Checking a correct input logs in context', async () => {
    //     const result = await skill(config)('input', context);
    //     expect(context.logger.info).toHaveBeenCalledTimes(2);
    //     assertValidOutput(result, config);
    // });
    let config = {
        "api_key": "rwwert",
        "number_of_hours": 12
    };
    test('Get the weather for a city', () => {
        expect(() => skill(config)({ city: 'Bangalore' }, context).toThrow('NO_INPUT'));
    });
});

