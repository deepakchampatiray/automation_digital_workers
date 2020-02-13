// skill-api.js

'use strict';

const axios = require('axios');
const iso3311a2 = require('iso-3166-1-alpha-2');

const DEFAULT_TIMEOUT = 5000; // Default timeout before aborting requests is set to 5000 ms (= 5 s).

// Estimates the average age of a person given his/her name.
// If countryId is defined, the estimate is performed for the provided country ID.
async function estimateAge(firstName, countryId, timeout) {
    const url = 'https://api.agify.io/';
    const config = {
        params: {
            'name': firstName
        },
        timeout: timeout
    };
    if (countryId) {
        if (!iso3311a2.getCodes().includes(countryId)) {
            throw new Error(`The ${countryId} country ID is not valid. Only ISO 3166-1 alpha-2 codes are supported.`);
        }
        config.params['country_id'] = countryId;
    }
    try {
        const response = await axios.get(url, config);
        const result = { name: response.data.name, age: response.data.age, count: response.data.count };
        if (response.data.country_id) {
            result.countryId = response.data.country_id;
        }
        return result;
    }
    catch (error) {
        throw new Error(`Request failed with status code ${error.response.status}: ${error.response.data.error}`);
    }
}

module.exports = function (configuration) {
    return async (input, context) => {

        if (!input) {
            throw new Error('Skill is called without input.');
        }

        context.logger.info('Skill is called with input', input);
        context.logger.info('Skill is called with configuration', configuration);

        let countryId;
        if (!configuration.hasOwnProperty('useCountry')) {
            throw new Error('The flag indicating whether to use the country is undefined. You must set the flag indicating whether to use the country in the configuration.');
        }
        if (configuration.useCountry === 'true') {
            if (configuration.countryRetrievalMethod === 'set') {
                if (!configuration.hasOwnProperty('countryId')) {
                    throw new Error('The country ID is missing in the configuration. You must set the country ID in the configuration or specify that you want to provide it at runtime.');
                }
                else {
                    countryId = configuration.countryId;
                }
                if (input.hasOwnProperty('countryId')) {
                    throw new Error('The country ID is already defined in the configuration and cannot be overridden at runtime.');
                }
            }
            else if (configuration.countryRetrievalMethod === 'provide') {
                // Country ID is supposed to be provided at runtime.
                if (!input.hasOwnProperty('countryId')) {
                    throw new Error('The country ID is undefined. You must set the country ID in the configuration or provide it in the `countryId` property in the input at runtime.');
                }
                else {
                    countryId = input.countryId;
                }
            }
            else {
                throw new Error('The country retrieval method is undefined. You must set the country retrieval method in the configuration.');
            }
        }

        const timeout = (input.timeout) ? input.timeout : DEFAULT_TIMEOUT;

        const result = await estimateAge(input.name, countryId, timeout);

        return result;
    };
};

