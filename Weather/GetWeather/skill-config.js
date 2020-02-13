// skill-config.js

'use strict';

const acceptLanguage = require('accept-language');
const iso3311a2 = require('iso-3166-1-alpha-2');

// Default locale is the first key in localizedData
const localizedData = {};
localizedData.en = require('./nls/en.json');

const CountryRetrievalMethod = {
    SET_IN_CONFIGURATION: 'set',
    PROVIDED_AT_RUNTIME: 'provide'
};

const schema_init = (locale) => {
    return {
        'type': 'object',
        'description': localizedData[locale].skill.description,
        'properties': {
            'useCountry': {
                'type': 'string',
                'enum': [
                    'true',
                    'false'
                ],
                'enumNames': [
                    localizedData[locale].skill.properties.useCountry.label,
                    localizedData[locale].skill.properties.useCountry.label
                ]
            },
            'link': {
                'type': 'string',
                'title': localizedData[locale].skill.properties.link.title,
                'description': localizedData[locale].skill.properties.link.description,
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
                                'title':  localizedData[locale].skill.properties.countryRetrievalMethod.title,
                                'type': 'string',
                                'enum': [
                                    CountryRetrievalMethod.SET_IN_CONFIGURATION,
                                    CountryRetrievalMethod.PROVIDED_AT_RUNTIME
                                ],
                                'enumNames': [
                                    localizedData[locale].skill.properties.countryRetrievalMethod.enumNames.setInConfiguration,
                                    localizedData[locale].skill.properties.countryRetrievalMethod.enumNames.providedAtRuntime
                                ],
                                'default': CountryRetrievalMethod.SET_IN_CONFIGURATION
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
                                                    CountryRetrievalMethod.SET_IN_CONFIGURATION
                                                ]
                                            },
                                            'countryId': {
                                                'title': localizedData[locale].skill.properties.countryId.title,
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
                                                    CountryRetrievalMethod.PROVIDED_AT_RUNTIME
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

const uiSchema_init = (locale) => {
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
            'ui:placeholder': localizedData[locale].skill.properties.countryId.placeholder,
            'ui:options': {
                'triggerEvent': 'changeCountryOption'
            }
        }

    };
};

const formData_init = () => {
    return {
        'useCountry': 'false'
    };
};

module.exports = {
    form: function (configuration, event, locales) { // eslint-disable-line no-unused-vars
        //locales supported by this skill
        const supportedLocales = Object.keys(localizedData);
        // Get locales to use given accepted Languages and supported languages
        acceptLanguage.languages(supportedLocales);
        const locale = acceptLanguage.get(locales);

        try {
            if (!configuration) {
                const err = new Error(localizedData[locale].errors.configurationIsNotValid.message);
                err.name = localizedData[locale].errors.configurationIsNotValid.name;
                throw err;
            }

            const schema = JSON.parse(JSON.stringify(schema_init(locale)));
            const uiSchema = JSON.parse(JSON.stringify(uiSchema_init(locale)));
            let formData = JSON.parse(JSON.stringify(formData_init(locale)));
            let isFormSubmittable = true;
            switch (event) {
                case 'init': {
                    // First event of configuration
                    formData = {
                        ...formData,
                        ...configuration
                    };
                    break;
                }
                case 'reopen': // Event executed when the skill is opened for edition.
                case 'changeCountryOption': {
                    if (configuration.useCountry) {
                        formData.useCountry = configuration.useCountry;
                    }
                    if (configuration.useCountry === 'true') {
                        formData.countryRetrievalMethod = configuration.countryRetrievalMethod;
                        if (configuration.countryRetrievalMethod === CountryRetrievalMethod.SET_IN_CONFIGURATION) {
                            formData.countryId = configuration.countryId;
                            if (!iso3311a2.getCodes().includes(configuration.countryId)) {
                                // Add error
                                schema.dependencies.useCountry.oneOf[0].dependencies.countryRetrievalMethod.oneOf[0].properties.countryId.error = localizedData[locale].skill.properties.countryId.error;
                                // Mark the form as non submittable.
                                isFormSubmittable = false;
                            }
                        }
                    }
                    break;
                }
                default: {
                    const err = new Error(`${event} ${localizedData[locale].errors.eventError.message}`);
                    err.name = localizedData[locale].errors.eventError.name;
                    return Promise.reject(err);
                }
            }
            return Promise.resolve({
                schema: schema,
                uiSchema: uiSchema,
                formData: formData,
                isFormSubmittable: isFormSubmittable
            });
        } catch (error) {
            const err = new Error(error.message);
            err.name = localizedData[locale].errors.unexpectedError.name;
            return Promise.reject(err);
        }
    },
    inputSchema: function (configuration) { // eslint-disable-line no-unused-vars
        // Your input schema can depend on the configuration of the skill
        const schema = {
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
        if ((configuration.useCountry === 'true') && (configuration.countryRetrievalMethod === 'provide')) {
            schema.properties['countryId'] = {
                'description': 'The ID of the country (in ISO 3166-1 alpha-2 format) to be used to estimate the age',
                'type': 'string'
            };
            schema.required.push('countryId');
        }
        return schema;
    },
    outputSchema: function (configuration) { // eslint-disable-line no-unused-vars
        // Your output schema can depend on the configuration of the skill
        const schema = {
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
        if (configuration.useCountry === 'true') {
            schema.properties['countryId'] = {
                'description': 'The ID of the country (in ISO 3166-1 alpha-2 format) used to estimate the age',
                'type': 'string'
            };
            schema.required.push('countryId');
        }
        return schema;
    },
    snippet: function (configuration) { // eslint-disable-line no-unused-vars
        // Your snippet can depend on what the configuration of the skill already provides.
        let snippet = '// Snippet code to get and execute a skill\n' +
            'const skill = task.getSkill("<SKILL_NAME>");\n';
        if ((configuration.useCountry === 'true') && (configuration.countryRetrievalMethod === 'provide')) {
            snippet = snippet +
                'const input = {\n' +
                '\tname: "Jane",\n' +
                '\tcountryId: "US"\n' +
                '};\n';
        }
        else {
            snippet = snippet +
                'const input = {\n' +
                '\tname: "Jane"\n' +
                '};\n';
        }
        snippet = snippet +
            'const result = await skill.execute(input);\n' +
            'task.context.logger.info(result);\n' +
            'return result;';
        return snippet;
    }
};
