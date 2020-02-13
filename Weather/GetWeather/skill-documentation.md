# GetWeather

### GetWeather - @ibm-adw/Weather
Get the weather for next 5 days with 3 hour duration.

Author: Deepak Champatiray
Category: act

Level: tech_preview

### Skill configuration
This is the configuration schema:
```json
{
  "type": "object",
  "properties": {
    "useCountry": {
      "type": "string",
      "enum": [
        "true",
        "false"
      ]
    }
  },
  "if": {
    "properties": {
      "useCountry": {
        "const": "true"
      }
    }
  },
  "then": {
    "properties": {
      "countryRetrievalMethod": {
        "type": "string",
        "enum": [
          "set",
          "provide"
        ]
      }
    },
    "if": {
      "properties": {
        "countryRetrievalMethod": {
          "const": "set"
        }
      }
    },
    "then": {
      "properties": {
        "useCountry": {
          "type": "string"
        },
        "countryRetrievalMethod": {
          "type": "string"
        },
        "countryId": {
          "type": "string"
        }
      },
      "additionalProperties": false,
      "required": [
        "countryId"
      ]
    },
    "else": {
      "properties": {
        "useCountry": {
          "type": "string"
        },
        "countryRetrievalMethod": {
          "type": "string"
        }
      },
      "additionalProperties": false
    },
    "required": [
      "countryRetrievalMethod"
    ]
  },
  "else": {
    "properties": {
      "useCountry": {
        "type": "string"
      }
    },
    "additionalProperties": false
  },
  "required": [
    "useCountry"
  ]
}
```

### Skill input Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Input schema for skill: Age Estimate",
  "type": "object",
  "properties": {
    "name": {
      "description": "The first name to be used to estimate the age",
      "type": "string"
    },
    "countryId": {
      "description": "The ID of the country (in ISO 3166-1 alpha-2 format) to be used to estimate the age, if you have not set the country in the configuration and you want to perform the estimate for a given country",
      "type": "string"
    },
    "timeout": {
      "description": "Timeout in milliseconds before canceling requests. This timeout is set by default to `5000` ms.",
      "type": "integer",
      "default": 5000,
      "minimum": 0
    }
  },
  "required": [
    "name"
  ]
}
```

### Skill output Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Output schema for skill: Age Estimate",
  "type": "object",
  "properties": {
    "name": {
      "description": "The first name used to estimate the age",
      "type": "string"
    },
    "age": {
      "description": "The estimated age",
      "type": "integer"
    },
    "count": {
      "description": "The number of persons with the given first name who are used to estimate the age",
      "type": "integer"
    },
    "countryId": {
      "description": "The ID of the country (in ISO 3166-1 alpha-2 format) used to estimate the age if the estimate is performed for a given country",
      "type": "string"
    }
  },
  "required": [
    "name",
    "age",
    "count"
  ]
}
```

### Code snippet
```json
// Snippet code to get and execute a skill
const skill = task.getSkill("<SKILL_NAME>");
const input = {
	name: "Jane"
};
const result = await skill.execute(input);
task.context.logger.info(result);
return result;
```

