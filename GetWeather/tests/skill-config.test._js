// skill-config.test.js

/* eslint-env jest */

'use strict';

const form = require('../skill-config')['form'];
const inputSchema = require('../skill-config')['inputSchema'];
const outputSchema = require('../skill-config')['outputSchema'];
const snippet = require('../skill-config')['snippet'];

const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');


const ajv = new Ajv();

const config = {};

const schemaSkill = () => {
    return {
        type: 'object',
        description: 'Check out skill-config.js file where you can customize your skill configuration.'
    };
};
const uiSchemaSkill = () => {
    return {};
};
const formDataSkill = () => {
    return {};
};

const config_schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../skill-spec.json'), { encoding: 'utf8' }))['config_schema'];

const inputSchemaExpected = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    'title': 'Skill input schema'
};
const outputSchemaExpected = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    'title': 'Skill output schema'
};
const snippetExpected = '// Snippet code to get and execute a skill\n' +
    'const skill = task.getSkill("<SKILL_NAME>");\n' +
    'const result = await skill.execute(<SKILL_INPUT>);\n' +
    'task.context.logger.info(result);\n' +
    'return result;';

const assertForm = (actual, expected, isFormSubmittable) => {
    // Test actual.schema is a valid JSON Schema
    expect(() => ajv.compile(actual.schema)).not.toThrow();
    // Test actual.uiSchema is a valid JSON Schema
    expect(() => ajv.compile(actual.uiSchema)).not.toThrow();

    if (isFormSubmittable) {
        // Test actual.formData is a valid JSON according to config_schema
        ajv.validate(config_schema, actual.formData);
        expect(ajv.errors).toBe(null);
    }

    expect(actual.schema).toStrictEqual(expected.schema);
    expect(actual.uiSchema).toStrictEqual(expected.uiSchema);
    expect(actual.formData).toStrictEqual(expected.formData);
    expect(actual.isFormSubmittable).toBe(expected.isFormSubmittable);
};

describe('SKILL CONFIG - Basic Tests', () => {

    test('Test config_schema is a valid JSON Schema', () => {
        expect(() => ajv.compile(config_schema)).not.toThrow();
    }, 30000);

    test('Invoke form on \'init\' event', async () => {
        const schemaSkillValue = schemaSkill();
        const uiSchemaSkillValue = uiSchemaSkill();
        const formDataSkillValue = formDataSkill();

        const expected = {
            schema: schemaSkillValue,
            uiSchema: uiSchemaSkillValue,
            formData: formDataSkillValue,
            isFormSubmittable: false
        };

        const configuration = await form({}, 'init', null);

        assertForm(configuration, expected, expected.isFormSubmittable);
    }, 30000);

    test('Invoke form with an unsupported event', async () => {
        await expect(form(config, 'dummy', null))
            .rejects
            .toThrow('dummy is not a valid event in the configuration of this skill');
    }, 30000);

    test('Invoke form with an unexpected configuration error', async () => {
        await expect(form(undefined, 'init', null))
            .rejects
            .toThrow('The configuration is not valid');
    }, 30000);

    test('Invoke form on \'reopen\' event', async () => {
        const schemaSkillValue = schemaSkill();
        const uiSchemaSkillValue = uiSchemaSkill();
        const formDataSkillValue = formDataSkill();

        const expected = {
            schema: schemaSkillValue,
            uiSchema: uiSchemaSkillValue,
            formData: formDataSkillValue,
            isFormSubmittable: false
        };

        const configuration = await form(config, 'reopen', null);

        assertForm(configuration, expected, expected.isFormSubmittable);
    }, 30000);

    test('Invoke inputSchema', () => {
        const inputSchemaValue = inputSchema(config);
        // Test inputSchemaValue is a valid JSON Schema
        expect(() => ajv.compile(inputSchemaValue)).not.toThrow();
        expect(inputSchemaValue).toStrictEqual(inputSchemaExpected);
    });

    test('Invoke outputSchema', () => {
        const outputSchemaValue = outputSchema(config);
        // Test outputSchemaValue is a valid JSON Schema
        expect(() => ajv.compile(outputSchemaValue)).not.toThrow();
        expect(outputSchemaValue).toStrictEqual(outputSchemaExpected);
    });

    test('Invoke snippet', () => {
        const snippetValue = snippet(config);
        expect(snippetValue).toBe(snippetExpected);
    });
});
