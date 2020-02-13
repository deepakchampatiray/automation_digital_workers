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

const schemaSkill = () => {
    return {
        'type': 'object',
        'description': 'Specify whether you want to estimate the age for a given country or not.',
        'properties': {
            'useCountry': {
                'type': 'string',
                'enum': [
                    'true',
                    'false'
                ],
                'enumNames': [
                    'Estimate the average age of a person for a given country',
                    'Estimate the average age of a person for a given country'
                ]
            },
            'link': {
                'type': 'string',
                'title': 'See the available data',
                'description': 'Don\'t know whether to choose a specific country or not?',
                'url': 'https://agify.io/our-data'
            }
        },
        'required': [
            'useCountry'
        ],
        'dependencies': {
            'useCountry': {
                'oneOf': [
                    {
                        'properties': {
                            'useCountry': {
                                'enum': [
                                    'true'
                                ]
                            },
                            'countryRetrievalMethod': {
                                'title': 'How do you want the country to be provided?',
                                'type': 'string',
                                'enum': [
                                    'set',
                                    'provide'
                                ],
                                'enumNames': [
                                    'Set the country now',
                                    'Set the country at runtime'
                                ],
                                'default': 'set'
                            },
                        },
                        'required': [
                            'countryRetrievalMethod'
                        ],
                        'dependencies': {
                            'countryRetrievalMethod': {
                                'oneOf': [
                                    {
                                        'properties': {
                                            'countryRetrievalMethod': {
                                                'enum': [
                                                    'set'
                                                ]
                                            },
                                            'countryId': {
                                                'title': 'Country',
                                                'type': 'string'
                                            }
                                        },
                                        'required': [
                                            'countryId'
                                        ]
                                    },
                                    {
                                        'properties': {
                                            'countryRetrievalMethod': {
                                                'enum': [
                                                    'provide'
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    {
                        'properties': {
                            'useCountry': {
                                'enum': [
                                    'false'
                                ]
                            }
                        }
                    }
                ]

            }
        }
    };
};
const uiSchemaSkill = () => {
    return {
        'useCountry': {
            'ui:widget': 'CheckboxWidget',
            'ui:options': {
                'triggerEvent': 'changeCountryOption'
            }
        },
        'link': {
            'ui:field': 'LinkField'
        },
        'countryRetrievalMethod': {
            'ui:widget': 'radio',
            'ui:options': {
                'triggerEvent': 'changeCountryOption'
            }
        },
        'countryId': {
            'ui:placeholder': 'Enter the country ID in ISO 3166-1 alpha-2 format. For example: US.',
            'ui:options': {
                'triggerEvent': 'changeCountryOption'
            }
        }

    };
};
const formDataSkill = () => {
    return {
        'useCountry': 'false'
    };
};

const config_schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../skill-spec.json'), { encoding: 'utf8' }))['config_schema'];

const inputSchemaExpected = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    'title': 'Input schema for skill: Age Estimate',
    'type': 'object',
    'properties': {
        'name': {
            'description': 'The first name to be used to estimate the age',
            'type': 'string'
        },
        'timeout': {
            'description': 'Timeout in milliseconds before canceling requests. This timeout is set by default to `5000` ms.',
            'type': 'integer',
            'default': 5000,
            'minimum': 0
        }
    },
    'required': [
        'name'
    ]
};

const inputSchemaExpectedWithCountryAtRuntime = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    'title': 'Input schema for skill: Age Estimate',
    'type': 'object',
    'properties': {
        'name': {
            'description': 'The first name to be used to estimate the age',
            'type': 'string'
        },
        'countryId': {
            'description': 'The ID of the country (in ISO 3166-1 alpha-2 format) to be used to estimate the age',
            'type': 'string'
        },
        'timeout': {
            'description': 'Timeout in milliseconds before canceling requests. This timeout is set by default to `5000` ms.',
            'type': 'integer',
            'default': 5000,
            'minimum': 0
        }
    },
    'required': [
        'name',
        'countryId'
    ]
};

const outputSchemaExpected = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    'title': 'Output schema for skill: Age Estimate',
    'type': 'object',
    'properties': {
        'name': {
            'description': 'The first name used to estimate the age',
            'type': 'string'
        },
        'age': {
            'description': 'The estimated age',
            'type': 'integer'
        },
        'count': {
            'description': 'The number of persons with the given first name who are used to estimate the age',
            'type': 'integer'
        }
    },
    'required': [
        'name',
        'age',
        'count'
    ]
};

const outputSchemaExpectedWithCountryAtRuntime = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    'title': 'Output schema for skill: Age Estimate',
    'type': 'object',
    'properties': {
        'name': {
            'description': 'The first name used to estimate the age',
            'type': 'string'
        },
        'age': {
            'description': 'The estimated age',
            'type': 'integer'
        },
        'count': {
            'description': 'The number of persons with the given first name who are used to estimate the age',
            'type': 'integer'
        },
        'countryId': {
            'description': 'The ID of the country (in ISO 3166-1 alpha-2 format) used to estimate the age',
            'type': 'string'
        }
    },
    'required': [
        'name',
        'age',
        'count',
        'countryId'
    ]
};

const snippetExpected = '// Snippet code to get and execute a skill\n' +
    'const skill = task.getSkill("<SKILL_NAME>");\n' +
    'const input = {\n' +
    '\tname: "Jane"\n' +
    '};\n' +
    'const result = await skill.execute(input);\n' +
    'task.context.logger.info(result);\n' +
    'return result;';

const snippetExpectedWithCountryAtRuntime = '// Snippet code to get and execute a skill\n' +
    'const skill = task.getSkill("<SKILL_NAME>");\n' +
    'const input = {\n' +
    '\tname: "Jane",\n' +
    '\tcountryId: "US"\n' +
    '};\n' +
    'const result = await skill.execute(input);\n' +
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

    test('Test config_schema without using country', () => {
        const formDataSkillValue = {
            'useCountry': 'false'
        };
        ajv.validate(config_schema, formDataSkillValue);
        expect(ajv.errors).toBe(null);
    }, 30000);

    test('Test config_schema without using country and with additional property', () => {
        const formDataSkillValue = {
            'useCountry': 'false',
            'otherProperty': 'value'
        };
        ajv.validate(config_schema, formDataSkillValue);
        const expected = [{'dataPath': '', 'keyword': 'additionalProperties', 'message': 'should NOT have additional properties', 'params': {'additionalProperty': 'otherProperty'}, 'schemaPath': '#/else/additionalProperties'}];
        expect(ajv.errors).toEqual(expected);
    }, 30000);

    test('Test config_schema with using country but without country retrieval method', () => {
        const formDataSkillValue = {
            'useCountry': 'true'
        };
        ajv.validate(config_schema, formDataSkillValue);
        const expected = [{'dataPath': '', 'keyword': 'required', 'message': 'should have required property \'countryRetrievalMethod\'', 'params': {'missingProperty': 'countryRetrievalMethod'}, 'schemaPath': '#/then/required'}];
        expect(ajv.errors).toEqual(expected);
    }, 30000);

    test('Test config_schema with using country and country retrieval method but without country ID', () => {
        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set'
        };
        ajv.validate(config_schema, formDataSkillValue);
        const expected = [{'dataPath': '', 'keyword': 'required', 'message': 'should have required property \'countryId\'', 'params': {'missingProperty': 'countryId'}, 'schemaPath': '#/then/then/required'}];
        expect(ajv.errors).toEqual(expected);
    }, 30000);

    test('Test config_schema with using country, country retrieval method and country ID provided in the configuration', () => {
        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
            'countryId': 'US'
        };
        ajv.validate(config_schema, formDataSkillValue);
        expect(ajv.errors).toBe(null);
    }, 30000);

    test('Test config_schema with using country, country retrieval method, country ID and additional property', () => {
        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
            'countryId': 'US',
            'otherProperty': 'value'
        };
        ajv.validate(config_schema, formDataSkillValue);
        const expected = [{'dataPath': '', 'keyword': 'additionalProperties', 'message': 'should NOT have additional properties', 'params': {'additionalProperty': 'otherProperty'}, 'schemaPath': '#/then/then/additionalProperties'}];
        expect(ajv.errors).toEqual(expected);
    }, 30000);

    test('Test config_schema with using country and country retrieval method set to \'provide\'', () => {
        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide'
        };
        ajv.validate(config_schema, formDataSkillValue);
        expect(ajv.errors).toBe(null);
    }, 30000);

    test('Test config_schema with using country, country retrieval method set to \'provide\' but with country ID in the configuration', () => {
        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide',
            'countryId': 'US',
        };
        ajv.validate(config_schema, formDataSkillValue);
        const expected = [{'dataPath': '', 'keyword': 'additionalProperties', 'message': 'should NOT have additional properties', 'params': {'additionalProperty': 'countryId'}, 'schemaPath': '#/then/else/additionalProperties'}];
        expect(ajv.errors).toEqual(expected);
    }, 30000);

    test('Test config_schema with using country, country retrieval method set to \'provide\' and additional property', () => {
        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide',
            'otherProperty': 'value'
        };
        ajv.validate(config_schema, formDataSkillValue);
        const expected = [{'dataPath': '', 'keyword': 'additionalProperties', 'message': 'should NOT have additional properties', 'params': {'additionalProperty': 'otherProperty'}, 'schemaPath': '#/then/else/additionalProperties'}];
        expect(ajv.errors).toEqual(expected);
    }, 30000);

    test('Test config_schema with using country, country retrieval method set to \'provide\' but with country ID in the configuration and additional property', () => {
        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide',
            'countryId': 'US',
            'otherProperty': 'value'
        };
        ajv.validate(config_schema, formDataSkillValue);
        const expected = [{'dataPath': '', 'keyword': 'additionalProperties', 'message': 'should NOT have additional properties', 'params': {'additionalProperty': 'countryId'}, 'schemaPath': '#/then/else/additionalProperties'}];
        expect(ajv.errors).toEqual(expected);
    }, 30000);

    test('Invoke form on \'init\' event', async () => {
        const schemaSkillValue = schemaSkill();
        const uiSchemaSkillValue = uiSchemaSkill();
        const formDataSkillValue = formDataSkill();

        const expected = {
            schema: schemaSkillValue,
            uiSchema: uiSchemaSkillValue,
            formData: formDataSkillValue,
            isFormSubmittable: true
        };

        const configuration = await form({}, 'init', null);

        assertForm(configuration, expected, expected.isFormSubmittable);
    }, 30000);

    test('Invoke form with an unsupported event', async () => {
        const config = {};
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
            isFormSubmittable: true
        };

        const config = {};
        const configuration = await form(config, 'reopen', null);

        assertForm(configuration, expected, expected.isFormSubmittable);
    }, 30000);

    test('Invoke form on \'changeCountryOption\' event (with country set at config time)', async () => {
        const schemaSkillValue = schemaSkill();
        const uiSchemaSkillValue = uiSchemaSkill();
        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
            'countryId': 'US'
        };

        const expected = {
            schema: schemaSkillValue,
            uiSchema: uiSchemaSkillValue,
            formData: formDataSkillValue,
            isFormSubmittable: true
        };

        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
            'countryId': 'US'
        };
        const configuration = await form(config, 'changeCountryOption', null);

        assertForm(configuration, expected, expected.isFormSubmittable);
    }, 30000);

    test('Invoke form on \'changeCountryOption\' event (with invalid country)', async () => {
        const schemaSkillValue = schemaSkill();
        schemaSkillValue.dependencies.useCountry.oneOf[0].dependencies.countryRetrievalMethod.oneOf[0].properties.countryId.error = 'is not a valid country ID. Only ISO 3166-1 alpha-2 codes are supported.';
        const uiSchemaSkillValue = uiSchemaSkill();

        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
            'countryId': 'UK'
        };

        const expected = {
            schema: schemaSkillValue,
            uiSchema: uiSchemaSkillValue,
            formData: formDataSkillValue,
            isFormSubmittable: false
        };

        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'set',
            'countryId': 'UK'
        };
        const configuration = await form(config, 'changeCountryOption', null);

        assertForm(configuration, expected, expected.isFormSubmittable);
    }, 30000);

    test('Invoke form on \'changeCountryOption\' event (with country set at runtime)', async () => {
        const schemaSkillValue = schemaSkill();
        const uiSchemaSkillValue = uiSchemaSkill();
        const formDataSkillValue = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide'
        };

        const expected = {
            schema: schemaSkillValue,
            uiSchema: uiSchemaSkillValue,
            formData: formDataSkillValue,
            isFormSubmittable: true
        };

        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide'
        };
        const configuration = await form(config, 'changeCountryOption', null);

        assertForm(configuration, expected, expected.isFormSubmittable);
    }, 30000);

    test('Invoke inputSchema without country set at runtime', () => {
        const config = {};
        const inputSchemaValue = inputSchema(config);
        // Test inputSchemaValue is a valid JSON Schema
        expect(() => ajv.compile(inputSchemaValue)).not.toThrow();
        expect(inputSchemaValue).toStrictEqual(inputSchemaExpected);
    });

    test('Invoke inputSchema with country set at runtime', () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide'
        };
        const inputSchemaValue = inputSchema(config);
        // Test inputSchemaValue is a valid JSON Schema
        expect(() => ajv.compile(inputSchemaValue)).not.toThrow();
        expect(inputSchemaValue).toStrictEqual(inputSchemaExpectedWithCountryAtRuntime);
    });

    test('Invoke outputSchema', () => {
        const config = {};
        const outputSchemaValue = outputSchema(config);
        // Test outputSchemaValue is a valid JSON Schema
        expect(() => ajv.compile(outputSchemaValue)).not.toThrow();
        expect(outputSchemaValue).toStrictEqual(outputSchemaExpected);
    });

    test('Invoke outputSchema with country set at runtime', () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide'
        };
        const outputSchemaValue = outputSchema(config);
        // Test outputSchemaValue is a valid JSON Schema
        expect(() => ajv.compile(outputSchemaValue)).not.toThrow();
        expect(outputSchemaValue).toStrictEqual(outputSchemaExpectedWithCountryAtRuntime);
    });

    test('Invoke snippet', () => {
        const config = {};
        const snippetValue = snippet(config);
        expect(snippetValue).toBe(snippetExpected);
    });

    test('Invoke snippet with country set at runtime', () => {
        const config = {
            'useCountry': 'true',
            'countryRetrievalMethod': 'provide'
        };
        const snippetValue = snippet(config);
        expect(snippetValue).toBe(snippetExpectedWithCountryAtRuntime);
    });

});
