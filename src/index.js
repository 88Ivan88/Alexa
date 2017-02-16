'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var personInfo = require('./personInfo');

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME"));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'SkillIntent': function () {
        var itemSlot = this.event.request.intent.slots.Item;
        var itemName;
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        var personSkills = this.t("SKILL_PERSON");
        var personDetailInfo = this.t("PERSON_INFO");
        var personNames = personSkills[itemName];
        //find the user list who are good at corresponding skill.
        if (personNames) {
            var answer = "According to the matching result, ";
            if(personNames instanceof Array && personNames.length >1){
                for (var i = 0; i < personNames.length; i++) {
                    var personName = personNames[i];
                    answer += personName;
                    if (i < personNames.length - 1) {
                        answer += ",";
                    }
                }
                answer +=" are";
            }else{
                answer += personNames;
                answer += " is";
            }
            answer += " good at " + itemName;
            this.attributes['speechOutput'] = answer;
            this.attributes['repromptSpeech'] = this.t("PERSON_INFO_REPEAT_MESSAGE");
            this.emit(':ask', answer, this.attributes['repromptSpeech']);

        } else {
            var speechOutput = this.t("PERSON_INFO_NOT_FOUND_MESSAGE");
            var repromptSpeech = this.t("PERSON_INFO_FOUND_REPROMPT");
            if (itemName) {
                speechOutput += this.t("PERSON_INFO_FOUND_WITH_ITEM_NAME", itemName);
            } else {
                speechOutput += this.t("PERSON_INFO_FOUND_WITHOUT_ITEM_NAME");
            }
            speechOutput += repromptSpeech;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'PersonIntent': function () {
        var itemSlotContactInfo = this.event.request.intent.slots.contactInfo;
        var itemSlotName = this.event.request.intent.slots.name;
        var speechOutput = "";
        var repromptSpeech = "";
        if (itemSlotName && itemSlotName.value) {
            itemSlotName = itemSlotName.value.toLowerCase();
            var userInfo = this.t("PERSON_INFO");
            userInfo = userInfo[itemSlotName];
            if (userInfo) {//get the new person from user list
                if (itemSlotContactInfo && itemSlotContactInfo.value) {
                    itemSlotContactInfo = itemSlotContactInfo.value.toLowerCase();
                    speechOutput = "the " + itemSlotContactInfo + " of " + itemSlotName + " is " + userInfo[itemSlotContactInfo];
                    repromptSpeech = this.t("PERSON_INFO_REPEAT_MESSAGE");
                } else {
                    speechOutput = this.t("PERSON_INFO_NOT_FOUND_MESSAGE");
                    repromptSpeech = this.t("PERSON_INFO_FOUND_REPROMPT");
                    speechOutput += this.t("PERSON_INFO_FOUND_WITH_CONTRACT_INFO", itemSlotName, itemSlotContactInfo);
                }
            } else {
                speechOutput = "sorry, currently we don't have the record for " + itemSlotName;
                repromptSpeech = this.t("PERSON_INFO_REPEAT_MESSAGE");
            }
        }
        this.emit(':ask', speechOutput, repromptSpeech);
    },

    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
        this.attributes['repromptSpeech'] = this.t("HELP_REPROMT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
};

var languageStrings = {
    "en-US": {
        "translation": {
            "SKILL_PERSON": personInfo.PERSON_SKILL_EN_US,
            "PERSON_INFO": personInfo.PERSON_INFO_EN_US,
            "SKILL_NAME": "Skill finder",
            "WELCOME_MESSAGE": "Welcome to %s. You can ask a question like, who is good at AI technology ? ... Now, what can I help you with.",
            "WELCOME_REPROMT": "For instructions on what you can say, please say help me.",
            "DISPLAY_CARD_TITLE": "%s  - skill for %s.",
            "HELP_MESSAGE": "You can ask questions such as, who knows the AI technology, or, you can say exit...Now, what can I help you with?",
            "HELP_REPROMT": "You can say things like, who learned the AI recently, or you can say exit...Now, what can I help you with?",
            "STOP_MESSAGE": "Goodbye!",
            "PERSON_INFO_REPEAT_MESSAGE": "Try saying repeat.",
            "PERSON_INFO_NOT_FOUND_MESSAGE": "I\'m sorry, I currently don\'t know ",
            "PERSON_INFO_FOUND_WITH_ITEM_NAME": "the person info for %s skill. ",
            "PERSON_INFO_FOUND_WITHOUT_ITEM_NAME": "that skill. ",
            "PERSON_INFO_FOUND_REPROMPT": "What else can I help with?",
            "PERSON_INFO_FOUND_WITH_CONTRACT_INFO": "%s\'s %s"
        }
    }
};