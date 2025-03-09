export const json = {
    "title": "Global Physical Activity Questionnaire (GPAQ)",
    "completedHtmlOnCondition": [{
      "expression": "{totalScore} > ({maxScore} / 3 * 2)",
      "html": "You got {totalScore} out of {maxScore} points. You did great!"
    }, {
      "expression": "{totalScore} <= ({maxScore} / 3)",
      "html": "You got {totalScore} out of {maxScore} points. Come on now, step up!"
    }, {
      "expression": "({maxScore} / 3 * 2) < {totalScore} <= ({maxScore} / 3)",
      "html": "You got {totalScore} out of {maxScore} points. Well done!"
    }],
    "pages": [{
      "name": "physical-activity",
      "title": "Physical Activity",
      "description":
        "Next we are going to ask you about the time you spend doing different types of physical activity in a typical week. Please answer these questions even if you do not consider yourself to be a physically active person. Think first about the time you spend doing work. Think of work as the things that you have to do, such as paid or unpaid work, study/training, household chores, harvesting food/crops, fishing or hunting for food, seeking employment. In answering the following questions, 'vigorous-intensity activities' are activities that require hard physical effort and cause large increases in breathing or heart rate, 'moderate-intensity activities' are activities that require moderate physical effort and cause small increases in breathing or heart rate.",
      "elements": [{
        "type": "panel",
        "name": "activity-at-work",
        "title": "Activity at work",
        "elements": [{
          "type": "radiogroup",
          "name": "does-vigorous-activity",
          "title":
            "Does your work involve vigorous-intensity activity that causes large increases in breathing or heart rate, for example, carrying or lifting heavy loads, digging or construction work for at least 10 minutes continuously?",
          "choices": [
            { "value": true, "text": "Yes", "score": 10 },
            { "value": false, "text": "No", "score": 0 }
          ]
        }, {
          "type": "radiogroup",
          "name": "vigorous-activity-frequency",
          "visibleIf": "{does-vigorous-activity} = true",
          "title":
            "In a typical week, on how many days do you do vigorous-intensity activities as part of your work?",
          "choices": [
            { "value": "rarely", "text": "A few", "score": 0 },
            { "value": "often", "text": "Every other day", "score": 5 },
            { "value": "everyday", "text": "Every day", "score": 10 }
          ]
        }, {
          "type": "rating",
          "name": "vigorous-activity-duration",
          "visibleIf": "{does-vigorous-activity} = true",
          "title":
            "How much time do you spend doing vigorous-intensity activities at work on a typical day?",
          "rateValues": [
            { "value": "littletime", "text": "1", "score": 2 },
            { "value": "sometime", "text": "2", "score": 7 },
            { "value": "fulltime", "text": "3", "score": 10 }
          ],
          "minRateDescription": "Less Than Two Hours",
          "maxRateDescription": "Full Time"
        }, {
          "type": "radiogroup",
          "name": "does-moderate-activity",
          "title": "Does your work involve moderate-intensity activity that causes small increases in breathing or heart rate, such as brisk walking or carrying light loads for at least 10 minutes continuously?",              
          "choices": [
            { "value": true, "text": "Yes", "score": 10 },
            { "value": false, "text": "No", "score": 0 }
          ]
        }, {
          "type": "radiogroup",
          "name": "moderate-activity-frequency",
          "visibleIf": "{does-moderate-activity} = true",
          "title": "In a typical week, on how many days do you do moderate-intensity activities as part of your work?",
          "choices": [
            { "value": "rarely", "text": "A few", "score": 0 },
            { "value": "often", "text": "Every other day", "score": 5 },
            { "value": "everyday", "text": "Every day", "score": 10 }
          ]
        }, {
          "type": "rating",
          "name": "moderate-activity-duration",
          "visibleIf": "{does-moderate-activity} = true",
          "title": "How much time do you spend doing moderate-intensity activities at work on a typical day?",
          "rateValues": [
            { "value": "littletime", "text": "1", "score": 2 },
            { "value": "sometime", "text": "2", "score": 7 },
            { "value": "fulltime", "text": "3", "score": 10 }
          ],
          "minRateDescription": "Less Than Two Hours",
          "maxRateDescription": "Full Time"
        }]
      }, {
        "type": "panel",
        "name": "traveling",
        "title": "Travelling to and from places",
        "description": "The next questions exclude the physical activities at work that you have already mentioned. Now we would like to ask you about the usual way you travel to and from places. For example, to work or for shopping.",
        "elements": [{
          "type": "radiogroup",
          "name": "does-walk-or-rides-bicycle",
          "title": "Do you walk or use a bicycle (pedal cycle) for at least 10 minutes continuously to get to and from places?",
          "choices": [
            { "value": true, "text": "Yes", "score": 10 },
            { "value": false, "text": "No", "score": 0 }
          ]
        }, {
          "type": "radiogroup", 
          "name": "walking-bicycling-frequency", 
          "visibleIf": "{does-walk-or-rides-bicycle} = true", 
          "title": "In a typical week, on how many days do you walk or bicycle for at least 10 minutes continuously to get to and from places?",
          "choices": [
            { "value": "rarely", "text": "A few", "score": 0 },
            { "value": "often", "text": "Every other day", "score": 5 },
            { "value": "everyday", "text": "Every day", "score": 10 }
          ]
        }, {
          "type": "rating",
          "name": "walking-bicycling-duration",
          "visibleIf": "{does-walk-or-rides-bicycle} = true",
          "title": "How much time do you spend walking or bicycling for travel on a typical day?",
          "rateValues": [
            { "value": "littletime", "text": "1", "score": 2 },
            { "value": "sometime", "text": "2", "score": 7 },
            { "value": "fulltime", "text": "3", "score": 10 }
          ],
          "minRateDescription": "Less Than Two Hours",
          "maxRateDescription": "Full Time"
        }]    
      }, {
        "type": "panel",
        "name": "recreational-activities-panel",
        "title": "Recreational activities",
        "description": "The next questions exclude the work and transport activities that you have already mentioned. Now we would like to ask you about sports, fitness, and recreational activities.",
        "elements": [{
          "type": "matrix",
          "name": "recreational-activities",
          "title": "Do you practice any of the following sports, fitness, or recteational activities at least 10 minutes continuously?",
          "description": "Select all that apply",
          "columns": [
            { "value": true, "text": "Yes", "score": 2 },
            { "value": false, "text": "No", "score": 0 }
          ],
          "rows": [
            { "value": "running", "text": "Running" },
            { "value": "football", "text": "Playing football" },
            { "value": "brisk-walking", "text": "Brisk walking" },
            { "value": "cycling", "text": "Cycling" },
            { "value": "swimming", "text": "Swimming" }
          ]
        }, {
          "type": "radiogroup",
          "name": "running-frequency",
          "visibleIf": "{recreational-activities.running} = true or {recreational-activities.football} = true",
          "title": "In a typical week, on how many days do you run or play football?",
          "choices": [
            { "value": "rarely", "text": "A few", "score": 0 },
            { "value": "often", "text": "Every other day", "score": 5 },
            { "value": "everyday", "text": "Every day", "score": 10 }
          ]
        }, {
          "type": "rating",
          "name": "running-duration",
          "visibleIf": "{recreational-activities.running} = true or {recreational-activities.football} = true",
          "title": "How much time do you spend on this on a typical day?",
          "rateValues": [
            { "value": "littletime", "text": "1", "score": 2 },
            { "value": "sometime", "text": "2", "score": 7 },
            { "value": "fulltime", "text": "3", "score": 10 }
          ],
          "minRateDescription": "Less Than Two Hours",
          "maxRateDescription": "Full Time"
        }, {
          "type": "radiogroup",
          "name": "swimming-etc-frequency",
          "visibleIf": "{recreational-activities.brisk-walking} = true or {recreational-activities.swimming} = true or {recreational-activities.cycling} = true",
          "title": "In a typical week, on how many days do you swim, cycle, or walk briskly?",
          "choices": [
            { "value": "rarely", "text": "A few", "score": 0 },
            { "value": "often", "text": "Every other day", "score": 5 },
            { "value": "everyday", "text": "Every day", "score": 10 }
          ]
        }, {
          "type": "rating",
          "name": "swimming-etc-duration",
          "visibleIf": "{recreational-activities.brisk-walking} = true or {recreational-activities.swimming} = true or {recreational-activities.cycling} = true",
          "title": "How much time do you spend doing these moderate-intensity sports on a typical day?",
          "rateValues": [
            { "value": "littletime", "text": "1", "score": 2 },
            { "value": "sometime", "text": "2", "score": 7 },
            { "value": "fulltime", "text": "3", "score": 10 }
          ],
          "minRateDescription": "Less Than Two Hours",
          "maxRateDescription": "Full Time"
        }]
      }, {
        "type": "panel",
        "name": "sedentary-behavior",
        "title": "Sedentary behavior",
        "description": "The following question is about sitting or reclining at work, at home, getting to and from places, or with friends, including time spent sitting at a desk, sitting with friends, travelling by car, bus, train, reading, playing cards or watching television; it does not include time spent sleeping.",
        "elements": [{
            "type": "rating",
            "name": "sedentary-behavior-duration",
            "title": "How much time do you usually spend sitting or reclining on a typical day?",
            "rateValues": [
              { "value": "littletime", "text": "1", "score": 10 },
              { "value": "sometime", "text": "2", "score": 7 },
              { "value": "fulltime", "text": "3", "score": 2 }
            ],
            "minRateDescription": "Less Than Two Hours",
            "maxRateDescription": "Full Time"
          }
        ]
      }]
    }]
  };
  

  
  