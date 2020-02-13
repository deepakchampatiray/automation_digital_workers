const skill = require('./skill-api');

skill({
    "api_key": "4212b6d2ad9d376ac74fe853bd7058c6",
    "number_of_hours": 12
})
(
    { city: 'Kuala Lumpur' },
    {
        logger:
        {
            info: console.info,
            error: console.error,
            log: console.log
        }
    }
)
.then(skillResp => console.log(skillResp));



//api.openweathermap.org/data/2.5/forecast?q=Bangalore,in&appid=4212b6d2ad9d376ac74fe853bd7058c6