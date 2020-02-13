# IBM Automation Digital Worker - skill creation documentation

Learn how to develop skills with IBM Automation Digital Worker by going through the following sections, which describe the skill lifecycle:
- [Developing a skill](#developing-a-skill)
- [Testing your skill](#testing-your-skill)
- [Documenting your skill](#documenting-your-skill)
- [Packaging and deploying a skill](#packaging-and-deploying-a-skill)

A skill is a **Node.js module** that represents a single, automated action that is triggered when the skill is invoked by a digital worker task. 

When you implement a skill, you must describe a form to display in Digital Worker in which you configure the skill, and a function that is triggered when the skill is invoked.

### Developing a skill
During the development of a skill, you must do the following steps:
- [Defining the configuration of your skill](#defining-the-configuration-of-your-skill): Describes both what is needed for a skill to be properly configured and how the form is displayed in Digital Worker for the user to provide the corresponding configuration information.
- [Implementing the execution part of your skill ](#implementing-the-execution-part-of-your-skill ): Implements a function to execute when the skill is invoked by a digital worker task.
- [Defining the metadata of your skill](#defining-the-metadata-of-your-skill): Provides information about the skill, such as its name, description, or version.

The initial structure of your project should look like the following:

```
MySkill
 ├── .eslintrc.json
 ├── .gitignore
 ├── .npmignore
 ├── nls
 │   ├── en.json
 ├── package.json
 ├── README.md
 ├── DOCUMENTATION.md
 ├── skill-api.js
 ├── skill-config.js
 ├── skill-documentation.md
 ├── skill-spec.json
 └── tests
     ├── skill-api.test.js
     └── skill-config.test.js
```

#### Defining the configuration of your skill
The configuration of the skill is provided in the `skill-config.js` file, which is located at the root of your project structure. 

This file defines the following functions that you must _export_:
- `form(configuration, event, locales)`: Returns a JSON schema to describe a configuration form to display in Digital Worker. For more information, see [The form function](#the-form-function) section.
- `inputSchema(configuration)`: Returns a JSON schema that defines the format of the data that the skill takes as input. For more information, see [The inputSchema and outputSchema functions](#the-inputschema-and-outputschema-functions) section.
- `outputSchema(configuration)`: Returns a JSON schema that defines the format of the data that the skill returns. For more information, see [The inputSchema and outputSchema functions](#the-inputschema-and-outputschema-functions)(#input-and-output-schemas-definitions).
- `snippet(configuration)`: Returns a code snippet to help the users of your skill to understand its usage. For more information, see [The snippet function](#the-snippet-function) section.

The following code snippet shows how to export the functions so that they can be invoked by Digital Worker:
```
module.exports = {
    form: function (configuration, event, locales) {
      // ...
    },
    inputSchema: function (configuration) {
      // ...
    },
    outputSchema: function (configuration) {
      // ...
    },
    snippet: function (configuration) {
      // ...
    }
};
```

> The configuration form is created with [React JSON schema Form](https://react-jsonschema-form.readthedocs.io/en/latest/) and rendered with [IBM Carbon Design System](https://github.com/carbon-design-system/carbon).

##### The `form` function
The `form` function takes three arguments:
- `configuration`: A JSON object that contains the current configuration of your skill.
- `event`: A string identifying the event that is triggered to render the configuration form. Must be one of:
  - `init`: An event triggered when opening the configuration form in Digital Worker for the first time.
  - `reopen`: An event triggered when editing the configuration form in Digital Worker. The fields might already be set.
  - Any custom events to identify a specific state of the configuration form. For more information, see [Dependencies between components in the same configuration form](#dependencies-between-components-in-the-same-configuration-form).
- `locales`: A string identifying the locales as specified by the [_Accept-Language_](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language) property, such as `en-GB,en;q=0.8,sv`.

> The `form` function must handle both the `init` and `reopen` events.

The function returns a resolved **[Promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise)** 
taking as argument a JSON object with the following properties:
- `schema` [*required*]: A JSON object that defines the properties to be handled in the configuration.
- `uiSchema` [*required*]: A JSON object that defines how to render the properties in Digital Worker. If no entry is specified for a property, the default rendering is used according to its type.
- `formData` [*optional*]: A JSON object that defines the data of the configuration. If provided during the `init` event, the values are used as the default values.
- `isFormSubmittable` [*optional*]: the boolean providing information, if the form contains enough information to be submitted. If this property is not provided, it is considered that the form can be submitted.

If an unexpected or unrecoverable error occurred, the `form` function must return a reject **Promise** with an **Error** that defines a name describing the error and a message as properties.

The following code snippet shows a basic example of the `form` function:

```
    form: function (configuration, event, locales) {
        try {
            // ...
            switch (event) {
                // Handle the 'init' event
                case 'init': {
                    // ...
                    return Promise.resolve({
                        schema: schema,
                        uiSchema: uiSchema,
                        formData: formData,
                        isFormSubmittable: true
                    });
                 },
            }
        } catch (error) {
            const err = new Error(error.message);
            err.name = 'MyErrorName';
            return Promise.reject(err);
        }
    }
```

If an unexpected error occurred that could not be handled and displayed by the form, the function must return reject a **Promise**
with an **Error** that defines a name describing the error and a message as properties.

> It is recommended to use the [React JSON schema Form playground](https://mozilla-services.github.io/react-jsonschema-form/) to start writing the `schema` and `uiSchema` JSON schemas for each event that is handled by the configuration of your skill.

###### Dependencies between components in the same configuration form

In a configuration form, you might have components that depend on the input of other components.

For example, you might need to input a URL to get data to fill another component. 

To do so, you can trigger an event while you input data in a component and invoke the `form` function with the triggered event and the inputted data.

To trigger an event, you must specify a `ui:options` property in the `uiSchema` JSON schema for the component that triggers the event. 
The `ui:options` property contains the `triggerEvent` property which defines the event identifier to pass to the `form` function.

For example, the following code snippet defines an event labeled 'myTriggerEvent' that is triggered when you input a URL in the `url` component:
```
  form: function (configuration, event, locales) {
      try {
          // ...
          switch (event) {
              // Handle the 'init' event
              case 'init': {
                  // ...
                  return Promise.resolve({
                      schema: schema,
                      // Definition of the event 'myTriggerEvent' triggered 
                      // when a user inputs a URL in the 'url ' component
                      uiSchema: {
                          'url': {
                              'ui:options': {
                                  'triggerEvent': 'myTriggerEvent'
                              }
                          }
                      },
                      formData: formData,
                      isFormSubmittable: false
                  });
              // Handle the event 'myTriggerEvent'
              case 'mytriggerEvent': {
                  // ...
              }
          }
      } catch (error) {
          const err = new Error(error.message);
          err.name = 'MyErrorName';
          return Promise.reject(err);
      }
  }
```
In this example, when you input a URL in the `url` field, an HTTP request is sent to invoke the `form` function with `myTriggerEvent` as the `event` argument, and the inputted values as the `configuration` argument.

For more information about usage of events, see the function `form(configuration, event, locales)` that is implemented in the `skill-config.js` file.

> Use [JSON Schema format](https://json-schema.org/latest/json-schema-validation.html#format) in your `schema` to enforce client-side form values validation.

You can enforce server-side validation on a form value and set an error message on a component of the form by adding a property error to its definition in the schema.

For example, you might want to display an error on a field URL because you received an error from the server. To do so, you must add a property `error` to the definition of the URL component in the schema, such as: `schema.properties.url.error = 'Server returned with an error';`

##### The `inputSchema` and `outputSchema` functions
The skill input and output JSON schemas are defined in the `skill-config.js` file, which is located at the root of your project structure.

This file defines the following functions that you must _export_:
- `inputSchema: function (configuration)`: This function takes as an argument the current configuration of the skill and returns a JSON schema that describes the input properties of the skill.
- `outputSchema: function (configuration)`: This function takes as an argument the current configuration of the skill and returns a JSON schema that describes the output properties of the skill.

The following code snippet shows how to export the functions so that they can be invoked by Digital Worker:
```
module.exports = {
    // ...
    inputSchema: function (configuration) {
      // ...
    },
    outputSchema: function (configuration) {
      // ...
    }
};
```

##### The `snippet` function
The skill snippet is defined in the `skill-config.js` file, which is located at the root of your project structure.

This file defines one function that you must _export_:
- `snippet: function (configuration)`: This function takes as an argument the current configuration of the skill and returns a string with a snippet \
on how to use the skill in the instructions of a digital worker task.

The following code snippet shows how to export the function so that they can be invoked by Digital Worker:
```
module.exports = {
    snippet: function (configuration) {
      // ...
    }
};
```

#### Implementing the execution part of your skill 
The execution part of your skill is provided in the `skill-api.js` file, which is located at the root of your project structure.

This file defines a single function that you must _export_:
```
module.exports = (configuration) => {
    return async (input, context) => {
        // ...
    }
}
```
The function takes one argument that represents the `configuration` as saved during the configuration of your skill.
It returns an asynchronous function that has two arguments:
  - `input`: the input of the skill as provided by the user of the skill.
  - `context`: The context in which the skill is invoked.

The following code snippet shows a basic implementation:
```
module.exports = function (configuration) {
    return async (input, context) => {
        context.logger.info('  - configuration: ', JSON.stringify(configuration));
        context.logger.info('  - input: ', JSON.stringify(input));
        return {
            // Something
        };
    };
};
```

#### Defining the metadata of your skill
Skill metadata are split into two files, depending on whether they are technical or business metadata.

##### Technical metadata
Technical metadata are defined in the `package.json` file, which is located at the root of your project structure.

> The `package.json` file is an asset of NPM. For more information, see [npm-package.json](https://docs.npmjs.com/files/package.json).

You must provide at least the following information:   
- `name`: The name is used to identify the NPM module that represents your skill. Optionally, it can be prefixed with a scope. For example: @MyScope/MySkillPackage
- `version`: The version is used to identify a specific version of the NPM module that represents your skill.

Example:
```
{
	"version": "1.0.0 ",
	"name": "@myscope/my-adw-skill",
}
```

> It is recommended to update the version of your skill after you upload it in Digital Worker to uniquely identify your skill in Digital Worker. For more information, see [npm-version](https://docs.npmjs.com/cli/version).  

##### Business metadata
Business metadata are defined in the `skill-spec.json` file, which is located at the root of your project structure.

You must provide the following information:    
- `name`[**required**]: The name of the skill that is displayed in Digital Worker.
- `description`[**required**]: The description of the skill that is displayed in Digital Worker.
* `category`[**required**]: The category of the skill to filter skills in Digital Worker. The possible categories are: `understand`, `act`, `decide`.
* `level`[**required**]: The level of the skill to indicate if it is suitable for production. The possible levels are: `tech_preview` and `released`.
* `config_schema`[**optional**]: The JSON schema that defines the configuration of the skill. If provided, it is used to validate the values of the configuration.

Example:
```
{
	"name": "My skill",
	"description": "My skill's description",
	"category": "understand",
	"level": "tech_preview",
	"config_schema": {
		"type": "object",
		"required": [
			"firstName",
			"lastName"
		],
		"properties": {
			"firstName": {
				"type": "string",
			},
			"lastName": {
				"type": "string",
			},
			"age": {
				"type": "integer",
			}
		}
	}
}
```

The name and the description can be translated. To do so, you must create a file named `skill-spec-<locale>.json`
that overrides the `name` and `description` properties.

For example, if you must translate the name and the description of your skill in French, you must create a file named `skill-spec-fr.json` with the following content:
```
{
  "name": "Mon nom",
  "description": "Ma description"
}
```

### Testing your skill

#### Testing the configuration of your skill
You can use the test kit that is provided to test your changes and see how it would look like in the user interface.

In the command-line tool, you must start the client and the server.

To start the server, type the following command:

`npx launch-server <path_to_your_skill_directory>`

To start the client, open a new tab and type the following command:

`npx launch-client`

> Make sure you installed the module `@ibm-adw/skill-toolkit` with the command line `npm i @ibm-adw/skill-toolkit -g -s`

You can then access a local version of the user interface, where you can see the results of your implementation in the configuration form. 
Side-panes are available for you to see the metadata of the skill (as read-only), the skill documentation, 
and the list of components that you can add in this skill. To add a component from this list, you can use the code snippets that are provided in each component.

After you modify the code for your skill, you can refresh the local test interface, and see your changes directly.

#### Testing the execution part of your skill
Open the IDE of your choice and load the project. Then, you can write unit tests with [jest](https://jestjs.io/).

Here is an example of unit test:
```
const my_skill = require('./skill-api.js');
cconst mock_configuration = {
     'foo': 'bar',
     'baz': 42
 };

 const configured_skill = my_skill(mock_configuration)

 const mock_input_1 = {
     'meow': 'woof',
     'zing': 0.07
 };
 configured_skill(mock_input_1);

```

Running the test above outputs the following:
```
configuration:  {"foo":"bar","baz":42}
input:  {"meow":"woof","zing":0.07}
```

You can see examples of unit tests in the `skill-api.test.js` file, which is located in the `tests` folder of your project structure.

> It is recommended that you ensure that your code is fully tested. The coverage information displayed when you run your tests can help you with that.

### Documenting your skill
Optionally, you can document your skill and make the documentation available in the user interface. To do so, you must write
your documentation in a markdown file named `skill-documentation.md`, which is located at the root of your project structure.

The `skill-documentation.md` file is used to generate an HTML page that you can access from Digital Worker
when you are configuring the skill or when you are writing the instructions of a digital worker task.

> To help users understand the purpose of your skill and how to configure your skill, it is recommended to provide
> an explanation on fields to input during the configuration of the skill, on how the skill is working and
> on the expected input and output of the skill.

### Packaging and deploying a skill
When you are satisfied with your skill and want to integrate it in Digital Worker, you must deploy your skill.

First, you must create a .tgz archive by typing the command line `npm pack` at the root of your project structure.

> A `.npmignore` is provided to remove files that should not be part of your NPM package.

Then, you must upload the .tgz file in Digital Worker. To do so:
- Open your instance of Digital Worker and go to the skill catalog.
- Click Import and select the .tgz archive.

> You cannot upload a skill multiple times if it has the same version number. If you modify your skill, make sure that you update the skill version in the `pacakge.json` file before uploading it again in Digital Worker.

You're done. Now, your skill is ready to be added in a digital worker task.
