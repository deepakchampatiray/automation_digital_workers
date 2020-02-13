// skill-config.js

'use strict';

const acceptLanguage = require('accept-language');

// Default locale is the first key in localizedData
const localizedData = {};
localizedData.en = require('./nls/en.json');

const schema_init = (locale) => {
    return {
        "type": "object",
        "title": "Weather report configurator",
        "description": "Set up how you want to receive your weather report.",
        "required": [
            "api_key"
        ],
        "properties": {
            "api_key": {
                "title": "API Key",
                "type": "string"
            },
            "number_of_hours": {
                "title": "Get prediction for ... hours",
                "type": "integer",
                "minimum": 3,
                "maximum": 36,
                "multipleOf": 3
            }
        }
    };
}

const uiSchema_init = () => {
    return {
        "api_key": {
            "ui:autofocus": true,
            'ui:options': {
                'triggerEvent': 'updateValues'
            }
        },
        "number_of_hours": {
            "ui:widget": "range",
            'ui:options': {
                'triggerEvent': 'updateValues'
            }
        }
    };
};

const formData_init = () => {
    return {
        "api_key": "",
        "number_of_hours": 6
    };
};

module.exports = {
    form: function (configuration, event, locales) { // eslint-disable-line no-unused-vars
        //locales supported by this skill
        const supportedLocales = Object.keys(localizedData);
        // Get locales to use given accepted Languages and supported languages
        //acceptLanguage.languages(supportedLocales);
        //const locale = acceptLanguage.get(locales);
        const locale = 'en';

        try {
            if (!configuration) {
                const err = new Error(localizedData[locale].errors.configurationIsNotValid.message);
                err.name = 'UndefinedConfiguration';
                throw err;
            }

            const schema = JSON.parse(JSON.stringify(schema_init(locale)));
            const uiSchema = JSON.parse(JSON.stringify(uiSchema_init(locale)));
            let formData = JSON.parse(JSON.stringify(formData_init(locale)));
            let isFormSubmittable = false;
            switch (event) {
                case 'init': {
                    // First event of configuration
                    formData = {
                        ...formData,
                        ...configuration
                    };
                    break;
                }
                case 'reopen': {
                    // Event executed when the skill is opened for edition. (can be the same as the 'initial' one)
                    formData = {
                        ...formData,
                        ...configuration
                    };
                    isFormSubmittable = !!configuration.api_key;
                    break;
                }
                case 'updateValues': {
                    console.log("Config", configuration, formData);
                    formData = {...configuration};
                    isFormSubmittable = !!configuration.api_key;
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
        return {
            '$schema': 'http://json-schema.org/draft-07/schema#',
            'title': 'Skill input schema'
        };
    },
    outputSchema: function (configuration) { // eslint-disable-line no-unused-vars
        // Your output schema can depend on the configuration of the skill
        return {
            '$schema': 'http://json-schema.org/draft-07/schema#',
            'title': 'Skill output schema'
        };
    },
    snippet: function (configuration) { // eslint-disable-line no-unused-vars
        // Your snippet can depend on what the configuration of the skill already provides.
        return '// Snippet code to get and execute a skill\n' +
            'const skill = task.getSkill("<SKILL_NAME>");\n' +
            'const result = await skill.execute(<SKILL_INPUT>);\n' +
            'task.context.logger.info(result);\n' +
            'return result;';
    }
};
