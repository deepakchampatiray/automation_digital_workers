# GetWeather

### GetWeather - @ibm-adw/Weather
Get the weather for next 5 days in 3 hours intervals.

Author: Deepak Champatiray
Category: act

Level: tech_preview

### Skill configuration
This is the configuration schema:
```json
{}
```

### Skill input Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Skill input schema"
}
```

### Skill output Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Skill output schema"
}
```

### Code snippet
```json
// Snippet code to get and execute a skill
const skill = task.getSkill("<SKILL_NAME>");
const result = await skill.execute(<SKILL_INPUT>);
task.context.logger.info(result);
return result;
```

