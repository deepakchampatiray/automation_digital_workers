// skill-api.js

'use strict';

const axios = require('axios');
const baseUri = 'http://api.openweathermap.org/data/2.5/forecast';//?q={CITY}&appid={API_KEY}'

module.exports = function (configuration) {
    return async (input, context) => {

        if (!input) {
            context.logger.error('Skill is called with no Input');
            throw new Error('NO_INPUT');
        }

        //console.log('skill is called with input', input);
        context.logger.info('Fetching weather with', input, configuration);
        //console.log('skill is called with configuration', configuration);

        try {
            const res = await axios.get(baseUri, {
                params: {
                    q: input.city,
                    appid: configuration.api_key,
                    units: 'metric'
                }
            });
            return {
                data: res.data.list
                    .filter((elem, index) => index < configuration.number_of_hours / 3)
                    .map(elem => {
                        return {
                            "time": elem.dt,
                            "temp": {
                                max: elem.main.temp_max,
                                min: elem.main.temp_min,
                            },
                            "weather": elem.weather[0].main
                        }
                    }),
                city: res.data.city
            }

        } catch (e) {
            console.error("error", e);
            throw e;
        }
    };
};

